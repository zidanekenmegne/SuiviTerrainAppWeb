from flask import Flask, render_template, request, redirect, url_for, flash
from config import Config
from models import db, Utilisateur, Categorie, PointDeVente, Visite, JournalConnexion
from datetime import datetime
import requests
import os
import re
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config.from_object(Config)

# Initialisation de la base de données
db.init_app(app)

# ==========================================================
# FONCTIONS DE VALIDATION
# ==========================================================

def valider_email(email):
    """Vérifie que l'email est valide"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def valider_telephone(telephone):
    """Vérifie que le téléphone est valide (format camerounais ou international)"""
    if not telephone:
        return True  # Le téléphone n'est pas obligatoire
    # Supprime les espaces, les tirets, les parenthèses
    tel = re.sub(r'[\s\-\(\)]', '', telephone)
    # Accepte les formats: +237XXXXXXXXX, 6XXXXXXXX, 2XXXXXXXX
    pattern = r'^(\+237|00237)?[0-9]{8,9}$'
    return re.match(pattern, tel) is not None

def valider_mot_de_passe(mdp):
    """Vérifie que le mot de passe fait au moins 6 caractères"""
    return len(mdp) >= 6

def valider_nom(nom):
    """Vérifie que le nom n'est pas vide et a au moins 2 caractères"""
    return nom and len(nom.strip()) >= 2

# ==========================================================
# FONCTIONS UTILITAIRES
# ==========================================================

def allowed_file(filename):
    """Vérifie si l'extension du fichier est autorisée"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def geocoder_adresse(adresse):
    """Convertit une adresse en latitude/longitude via Nominatim (OpenStreetMap)"""
    try:
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "q": adresse,
            "format": "json",
            "limit": 1,
            "accept-language": "fr"
        }
        headers = {
            "User-Agent": "SuiviTerrainApp/1.0"
        }
        response = requests.get(url, params=params, headers=headers, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if data:
                return {
                    "latitude": float(data[0]["lat"]),
                    "longitude": float(data[0]["lon"])
                }
        return None
    except:
        return None

# ==========================================================
# ROUTES PRINCIPALES
# ==========================================================

@app.route('/')
def index():
    return redirect(url_for('tableau_bord'))

@app.route('/tableau-bord')
def tableau_bord():
    # Données statistiques
    total_visites = Visite.query.count()
    total_realisees = Visite.query.filter_by(statut='realisee').count()
    total_encours = Visite.query.filter_by(statut='encours').count()
    total_attente = Visite.query.filter_by(statut='attente').count()
    
    # Dernières visites
    visites_recentes = Visite.query.order_by(Visite.date_creation.desc()).limit(5).all()
    
    # Date actuelle
    date_actuelle = datetime.now().strftime('%d %B %Y')
    
    return render_template('tableau-bord.html',
        total_visites=total_visites,
        total_realisees=total_realisees,
        total_encours=total_encours,
        total_attente=total_attente,
        visites_recentes=visites_recentes,
        date_actuelle=date_actuelle
    )

# ==========================================================
# ROUTES POINTS DE VENTE
# ==========================================================

@app.route('/points-vente')
def points_vente():
    points = PointDeVente.query.order_by(PointDeVente.nom_pt).all()
    categories = Categorie.query.order_by(Categorie.nom_cat).all()
    return render_template('points-vente.html', points=points, categories=categories)

@app.route('/points-vente/ajouter', methods=['GET', 'POST'])
def ajouter_point():
    if request.method == 'POST':
        nom = request.form.get('nom', '').strip()
        adresse = request.form.get('adresse', '').strip()
        latitude = request.form.get('latitude')
        longitude = request.form.get('longitude')
        telephone = request.form.get('telephone', '').strip()
        id_cat = request.form.get('categorie')

        # === VALIDATIONS ===
        if not valider_nom(nom):
            flash('Le nom est obligatoire et doit contenir au moins 2 caractères.', 'danger')
            return redirect(url_for('ajouter_point'))

        if not adresse:
            flash('L\'adresse est obligatoire.', 'danger')
            return redirect(url_for('ajouter_point'))

        if telephone and not valider_telephone(telephone):
            flash('Le numéro de téléphone n\'est pas valide. Utilisez un format comme +237 612 34 56 78', 'danger')
            return redirect(url_for('ajouter_point'))

        # === Gestion de la photo ===
        photo_filename = None
        if 'photo' in request.files:
            file = request.files['photo']
            if file and file.filename != '' and allowed_file(file.filename):
                os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
                filename = secure_filename(file.filename)
                unique_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_filename))
                photo_filename = f"uploads/{unique_filename}"

        # === Géocodage automatique ===
        coords = None
        if (not latitude or not longitude) and adresse:
            coords = geocoder_adresse(adresse)
            if coords:
                latitude = coords["latitude"]
                longitude = coords["longitude"]
                flash('📍 Coordonnées GPS automatiquement détectées', 'success')
            else:
                flash('⚠️ Adresse non reconnue. Les coordonnées resteront vides.', 'warning')

        if not latitude or not longitude:
            latitude = None
            longitude = None

        # === Création du point ===
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
        return redirect(url_for('points_vente'))

    categories = Categorie.query.all()
    return render_template('ajouter-point.html', categories=categories)

@app.route('/points-vente/modifier/<int:id>', methods=['GET', 'POST'])
def modifier_point(id):
    point = PointDeVente.query.get_or_404(id)
    
    if request.method == 'POST':
        nom = request.form.get('nom', '').strip()
        adresse = request.form.get('adresse', '').strip()
        telephone = request.form.get('telephone', '').strip()
        id_cat = request.form.get('categorie')

        # === VALIDATIONS ===
        if not valider_nom(nom):
            flash('Le nom est obligatoire et doit contenir au moins 2 caractères.', 'danger')
            return redirect(url_for('modifier_point', id=id))

        if not adresse:
            flash('L\'adresse est obligatoire.', 'danger')
            return redirect(url_for('modifier_point', id=id))

        if telephone and not valider_telephone(telephone):
            flash('Le numéro de téléphone n\'est pas valide.', 'danger')
            return redirect(url_for('modifier_point', id=id))

        # === Mise à jour ===
        point.nom_pt = nom
        point.adresse = adresse
        point.telephone = telephone if telephone else None
        point.id_cat = int(id_cat) if id_cat else None
        point.date_modif = datetime.now()

        # Gestion de la nouvelle photo
        if 'photo' in request.files:
            file = request.files['photo']
            if file and file.filename != '' and allowed_file(file.filename):
                os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
                filename = secure_filename(file.filename)
                unique_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_filename))
                point.photo = f"uploads/{unique_filename}"
        
        db.session.commit()
        flash('✅ Point de vente modifié avec succès', 'success')
        return redirect(url_for('points_vente'))
    
    categories = Categorie.query.all()
    return render_template('modifier-point.html', point=point, categories=categories)

@app.route('/points-vente/supprimer/<int:id>')
def supprimer_point(id):
    point = PointDeVente.query.get_or_404(id)
    
    # Vérifier si des visites sont associées
    visites_associees = Visite.query.filter_by(id_pt=id).count()
    if visites_associees > 0:
        flash(f'Impossible de supprimer : {visites_associees} visite(s) sont associées à ce point.', 'danger')
        return redirect(url_for('points_vente'))
    
    db.session.delete(point)
    db.session.commit()
    flash('🗑️ Point de vente supprimé avec succès', 'success')
    return redirect(url_for('points_vente'))

# ==========================================================
# ROUTES VISITES
# ==========================================================

@app.route('/visites')
def list_visites():
    visites = Visite.query.order_by(Visite.date_prevue.desc()).all()
    return render_template('visites.html', visites=visites)

@app.route('/visites/ajouter', methods=['GET', 'POST'])
def ajouter_visite():
    if request.method == 'POST':
        date_prevue = request.form.get('date_prevue')
        heure_prevue = request.form.get('heure_prevue')
        id_pt = request.form.get('point_vente')
        statut = request.form.get('statut', 'planifiee')
        compte_rendu = request.form.get('compte_rendu', '').strip()

        # === VALIDATIONS ===
        if not date_prevue:
            flash('La date est obligatoire.', 'danger')
            return redirect(url_for('ajouter_visite'))

        if not heure_prevue:
            flash('L\'heure est obligatoire.', 'danger')
            return redirect(url_for('ajouter_visite'))

        if not id_pt:
            flash('Le point de vente est obligatoire.', 'danger')
            return redirect(url_for('ajouter_visite'))

        # Vérifier que la date n'est pas dans le passé (pour les nouvelles visites)
        date_obj = datetime.strptime(date_prevue, '%Y-%m-%d').date()
        if date_obj < datetime.now().date():
            flash('La date ne peut pas être dans le passé.', 'danger')
            return redirect(url_for('ajouter_visite'))

        # === Création ===
        nouvelle_visite = Visite(
            date_prevue=date_obj,
            heure_prevue=datetime.strptime(heure_prevue, '%H:%M').time(),
            id_pt=int(id_pt),
            statut=statut,
            compte_rendu=compte_rendu if compte_rendu else None,
            date_creation=datetime.now()
        )
        
        db.session.add(nouvelle_visite)
        db.session.commit()
        flash('✅ Visite planifiée avec succès', 'success')
        return redirect(url_for('list_visites'))
    
    points = PointDeVente.query.all()
    return render_template('ajouter-visite.html', points=points)

@app.route('/visites/modifier/<int:id>', methods=['GET', 'POST'])
def modifier_visite(id):
    visite = Visite.query.get_or_404(id)
    
    if request.method == 'POST':
        date_prevue = request.form.get('date_prevue')
        heure_prevue = request.form.get('heure_prevue')
        id_pt = request.form.get('point_vente')
        statut = request.form.get('statut')
        compte_rendu = request.form.get('compte_rendu', '').strip()

        # === VALIDATIONS ===
        if not date_prevue or not heure_prevue or not id_pt:
            flash('Tous les champs obligatoires doivent être remplis.', 'danger')
            return redirect(url_for('modifier_visite', id=id))

        # === Mise à jour ===
        visite.date_prevue = datetime.strptime(date_prevue, '%Y-%m-%d').date()
        visite.heure_prevue = datetime.strptime(heure_prevue, '%H:%M').time()
        visite.id_pt = int(id_pt)
        visite.statut = statut
        visite.compte_rendu = compte_rendu if compte_rendu else None
        visite.date_modif = datetime.now()
        
        db.session.commit()
        flash('✅ Visite modifiée avec succès', 'success')
        return redirect(url_for('list_visites'))
    
    points = PointDeVente.query.all()
    return render_template('modifier-visite.html', visite=visite, points=points)

@app.route('/visites/supprimer/<int:id>')
def supprimer_visite(id):
    visite = Visite.query.get_or_404(id)
    
    # Vérifier si la visite est déjà réalisée
    if visite.statut == 'realisee':
        flash('Impossible de supprimer une visite déjà réalisée.', 'danger')
        return redirect(url_for('list_visites'))
    
    db.session.delete(visite)
    db.session.commit()
    flash('🗑️ Visite supprimée avec succès', 'success')
    return redirect(url_for('list_visites'))

# ==========================================================
# ROUTES CATEGORIES
# ==========================================================

@app.route('/categories')
def liste_categories():
    categories = Categorie.query.order_by(Categorie.nom_cat).all()
    return render_template('categories.html', categories=categories)

@app.route('/categories/ajouter', methods=['GET', 'POST'])
def ajouter_categorie():
    if request.method == 'POST':
        nom = request.form.get('nom', '').strip()
        couleur = request.form.get('couleur', '').strip()

        # === VALIDATIONS ===
        if not valider_nom(nom):
            flash('Le nom est obligatoire et doit contenir au moins 2 caractères.', 'danger')
            return redirect(url_for('ajouter_categorie'))

        if not couleur:
            flash('La couleur est obligatoire.', 'danger')
            return redirect(url_for('ajouter_categorie'))

        # Vérifier si la catégorie existe déjà
        existante = Categorie.query.filter_by(nom_cat=nom).first()
        if existante:
            flash('Une catégorie avec ce nom existe déjà.', 'danger')
            return redirect(url_for('ajouter_categorie'))

        # === Création ===
        nouvelle_categorie = Categorie(
            nom_cat=nom,
            couleur=couleur,
            date_creation_cat=datetime.now()
        )
        
        db.session.add(nouvelle_categorie)
        db.session.commit()
        flash('✅ Catégorie ajoutée avec succès', 'success')
        return redirect(url_for('liste_categories'))
    
    return render_template('ajouter-categorie.html')

@app.route('/categories/modifier/<int:id>', methods=['GET', 'POST'])
def modifier_categorie(id):
    categorie = Categorie.query.get_or_404(id)
    
    if request.method == 'POST':
        nom = request.form.get('nom', '').strip()
        couleur = request.form.get('couleur', '').strip()

        # === VALIDATIONS ===
        if not valider_nom(nom):
            flash('Le nom est obligatoire et doit contenir au moins 2 caractères.', 'danger')
            return redirect(url_for('modifier_categorie', id=id))

        if not couleur:
            flash('La couleur est obligatoire.', 'danger')
            return redirect(url_for('modifier_categorie', id=id))

        # === Mise à jour ===
        categorie.nom_cat = nom
        categorie.couleur = couleur
        db.session.commit()
        flash('✅ Catégorie modifiée avec succès', 'success')
        return redirect(url_for('liste_categories'))
    
    return render_template('modifier-categorie.html', categorie=categorie)

@app.route('/categories/supprimer/<int:id>')
def supprimer_categorie(id):
    categorie = Categorie.query.get_or_404(id)
    
    # Vérifier si des points utilisent cette catégorie
    points_associes = PointDeVente.query.filter_by(id_cat=id).count()
    if points_associes > 0:
        flash(f'Impossible de supprimer : {points_associes} point(s) utilisent cette catégorie.', 'danger')
        return redirect(url_for('liste_categories'))
    
    db.session.delete(categorie)
    db.session.commit()
    flash('🗑️ Catégorie supprimée avec succès', 'success')
    return redirect(url_for('liste_categories'))

# ==========================================================
# ROUTES UTILISATEURS
# ==========================================================

@app.route('/utilisateurs')
def liste_utilisateurs():
    utilisateurs = Utilisateur.query.order_by(Utilisateur.nom_user).all()
    return render_template('utilisateurs.html', utilisateurs=utilisateurs)

@app.route('/utilisateurs/ajouter', methods=['GET', 'POST'])
def ajouter_utilisateur():
    if request.method == 'POST':
        nom = request.form.get('nom', '').strip()
        email = request.form.get('email', '').strip()
        mdp = request.form.get('mdp', '')
        role = request.form.get('role', 'agent')
        zone = request.form.get('zone_intervention', '').strip()

        # === VALIDATIONS ===
        if not valider_nom(nom):
            flash('Le nom est obligatoire et doit contenir au moins 2 caractères.', 'danger')
            return redirect(url_for('ajouter_utilisateur'))

        if not email or not valider_email(email):
            flash('Veuillez entrer une adresse email valide.', 'danger')
            return redirect(url_for('ajouter_utilisateur'))

        if not mdp or not valider_mot_de_passe(mdp):
            flash('Le mot de passe doit contenir au moins 6 caractères.', 'danger')
            return redirect(url_for('ajouter_utilisateur'))

        # Vérifier si l'email existe déjà
        existant = Utilisateur.query.filter_by(mail=email).first()
        if existant:
            flash('Cet email est déjà utilisé.', 'danger')
            return redirect(url_for('ajouter_utilisateur'))

        # Hachage du mot de passe
        mdp_hash = generate_password_hash(mdp)

        # === Création ===
        nouvel_utilisateur = Utilisateur(
            nom_user=nom,
            mail=email,
            mdp=mdp_hash,
            role=role,
            zone_intervention=zone if zone else None,
            date_creation_user=datetime.now()
        )

        db.session.add(nouvel_utilisateur)
        db.session.commit()
        flash('✅ Utilisateur ajouté avec succès', 'success')
        return redirect(url_for('liste_utilisateurs'))

    return render_template('ajouter-utilisateur.html')

@app.route('/utilisateurs/modifier/<int:id>', methods=['GET', 'POST'])
def modifier_utilisateur(id):
    utilisateur = Utilisateur.query.get_or_404(id)
    
    if request.method == 'POST':
        nom = request.form.get('nom', '').strip()
        email = request.form.get('email', '').strip()
        mdp = request.form.get('mdp', '')
        role = request.form.get('role', 'agent')
        zone = request.form.get('zone_intervention', '').strip()

        # === VALIDATIONS ===
        if not valider_nom(nom):
            flash('Le nom est obligatoire et doit contenir au moins 2 caractères.', 'danger')
            return redirect(url_for('modifier_utilisateur', id=id))

        if not email or not valider_email(email):
            flash('Veuillez entrer une adresse email valide.', 'danger')
            return redirect(url_for('modifier_utilisateur', id=id))

        # Vérifier si l'email est déjà utilisé par un autre utilisateur
        existant = Utilisateur.query.filter(
            Utilisateur.mail == email,
            Utilisateur.id_user != id
        ).first()
        if existant:
            flash('Cet email est déjà utilisé par un autre utilisateur.', 'danger')
            return redirect(url_for('modifier_utilisateur', id=id))

        # === Mise à jour ===
        utilisateur.nom_user = nom
        utilisateur.mail = email
        utilisateur.role = role
        utilisateur.zone_intervention = zone if zone else None

        # Gestion du mot de passe (optionnel)
        if mdp:
            if not valider_mot_de_passe(mdp):
                flash('Le mot de passe doit contenir au moins 6 caractères.', 'danger')
                return redirect(url_for('modifier_utilisateur', id=id))
            utilisateur.mdp = generate_password_hash(mdp)

        db.session.commit()
        flash('✅ Utilisateur modifié avec succès', 'success')
        return redirect(url_for('liste_utilisateurs'))
    
    return render_template('modifier-utilisateur.html', utilisateur=utilisateur)

@app.route('/utilisateurs/supprimer/<int:id>')
def supprimer_utilisateur(id):
    utilisateur = Utilisateur.query.get_or_404(id)
    
    # Ne pas supprimer l'admin principal (par exemple, l'utilisateur avec id=1)
    if id == 1:
        flash('Impossible de supprimer l\'administrateur principal.', 'danger')
        return redirect(url_for('liste_utilisateurs'))
    
    # Vérifier si l'utilisateur a des visites
    visites_associees = Visite.query.filter_by(id_utilisateur=id).count()
    if visites_associees > 0:
        flash(f'Impossible de supprimer : {visites_associees} visite(s) sont associées à cet utilisateur.', 'danger')
        return redirect(url_for('liste_utilisateurs'))
    
    db.session.delete(utilisateur)
    db.session.commit()
    flash('🗑️ Utilisateur supprimé avec succès', 'success')
    return redirect(url_for('liste_utilisateurs'))

# ==========================================================
# POINT D'ENTRÉE
# ==========================================================

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Créer le dossier uploads s'il n'existe pas
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=5000)