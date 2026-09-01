from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required
from models import db, PointDeVente, Categorie
from datetime import datetime
import os
import re
from werkzeug.utils import secure_filename
from config import Config

points_bp = Blueprint('points', __name__, url_prefix='/points')

# ==========================================================
# FONCTIONS DE VALIDATION
# ==========================================================

def valider_telephone(telephone):
    if not telephone:
        return True
    tel = re.sub(r'[\s\-\(\)]', '', telephone)
    pattern = r'^(\+237|00237)?[0-9]{8,9}$'
    return re.match(pattern, tel) is not None

def valider_nom(nom):
    return nom and len(nom.strip()) >= 2

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

# ==========================================================
# ROUTES CRUD POINTS
# ==========================================================

@points_bp.route('/')
@login_required
def liste():
    points = PointDeVente.query.order_by(PointDeVente.nom_pt).all()
    categories = Categorie.query.order_by(Categorie.nom_cat).all()
    return render_template('points-vente.html', points=points, categories=categories)

@points_bp.route('/ajouter', methods=['GET', 'POST'])
@login_required
def ajouter():
    if request.method == 'POST':
        nom = request.form.get('nom', '').strip()
        adresse = request.form.get('adresse', '').strip()
        latitude = request.form.get('latitude')
        longitude = request.form.get('longitude')
        telephone = request.form.get('telephone', '').strip()
        id_cat = request.form.get('categorie')

        if not valider_nom(nom):
            flash('Le nom doit contenir au moins 2 caractères.', 'danger')
            return redirect(url_for('points.ajouter'))

        if not adresse:
            flash('L\'adresse est obligatoire.', 'danger')
            return redirect(url_for('points.ajouter'))

        if telephone and not valider_telephone(telephone):
            flash('Le numéro de téléphone n\'est pas valide.', 'danger')
            return redirect(url_for('points.ajouter'))

        photo_filename = None
        if 'photo' in request.files:
            file = request.files['photo']
            if file and file.filename != '' and allowed_file(file.filename):
                os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
                filename = secure_filename(file.filename)
                unique_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
                file.save(os.path.join(Config.UPLOAD_FOLDER, unique_filename))
                photo_filename = f"uploads/{unique_filename}"

        # Géocodage (à importer si besoin)
        from app import geocoder_adresse
        coords = None
        if (not latitude or not longitude) and adresse:
            coords = geocoder_adresse(adresse)
            if coords:
                latitude = coords["latitude"]
                longitude = coords["longitude"]
                flash('📍 Coordonnées GPS automatiquement détectées', 'success')
            else:
                flash('⚠️ Adresse non reconnue.', 'warning')

        if not latitude or not longitude:
            latitude = None
            longitude = None

        nouveau_point = PointDeVente(
            nom_pt=nom,
            adresse=adresse,
            latitude=latitude,
            longitude=longitude,
            telephone=telephone if telephone else None,
            photo=photo_filename,
            id_cat=int(id_cat) if id_cat else None,
            date_creation_pt=datetime.now()
        )

        db.session.add(nouveau_point)
        db.session.commit()
        flash('✅ Point de vente ajouté avec succès', 'success')
        return redirect(url_for('points.liste'))

    categories = Categorie.query.all()
    return render_template('ajouter-point.html', categories=categories)

@points_bp.route('/modifier/<int:id>', methods=['GET', 'POST'])
@login_required
def modifier(id):
    point = PointDeVente.query.get_or_404(id)

    if request.method == 'POST':
        nom = request.form.get('nom', '').strip()
        adresse = request.form.get('adresse', '').strip()
        telephone = request.form.get('telephone', '').strip()
        id_cat = request.form.get('categorie')

        if not valider_nom(nom):
            flash('Le nom doit contenir au moins 2 caractères.', 'danger')
            return redirect(url_for('points.modifier', id=id))

        if not adresse:
            flash('L\'adresse est obligatoire.', 'danger')
            return redirect(url_for('points.modifier', id=id))

        if telephone and not valider_telephone(telephone):
            flash('Le numéro de téléphone n\'est pas valide.', 'danger')
            return redirect(url_for('points.modifier', id=id))

        point.nom_pt = nom
        point.adresse = adresse
        point.telephone = telephone if telephone else None
        point.id_cat = int(id_cat) if id_cat else None
        point.date_modif = datetime.now()

        if 'photo' in request.files:
            file = request.files['photo']
            if file and file.filename != '' and allowed_file(file.filename):
                os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
                filename = secure_filename(file.filename)
                unique_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
                file.save(os.path.join(Config.UPLOAD_FOLDER, unique_filename))
                point.photo = f"uploads/{unique_filename}"

        db.session.commit()
        flash('✅ Point de vente modifié avec succès', 'success')
        return redirect(url_for('points.liste'))

    categories = Categorie.query.all()
    return render_template('modifier-point.html', point=point, categories=categories)

@points_bp.route('/supprimer/<int:id>')
@login_required
def supprimer(id):
    point = PointDeVente.query.get_or_404(id)
    db.session.delete(point)
    db.session.commit()
    flash('🗑️ Point de vente supprimé avec succès', 'success')
    return redirect(url_for('points.liste'))