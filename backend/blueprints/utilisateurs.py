from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required
from werkzeug.security import generate_password_hash
from models import db, Utilisateur, Visite
from datetime import datetime
from decorators import admin_required
import re

utilisateurs_bp = Blueprint('utilisateurs', __name__, url_prefix='/utilisateurs')

def valider_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def valider_mot_de_passe(mdp):
    return len(mdp) >= 6

def valider_nom(nom):
    return nom and len(nom.strip()) >= 2

@utilisateurs_bp.route('/')
@login_required
@admin_required
def liste():
    utilisateurs = Utilisateur.query.order_by(Utilisateur.nom_user).all()
    return render_template('utilisateurs.html', utilisateurs=utilisateurs)

@utilisateurs_bp.route('/ajouter', methods=['GET', 'POST'])
@login_required
def ajouter():
    if request.method == 'POST':
        nom = request.form.get('nom', '').strip()
        email = request.form.get('email', '').strip()
        mdp = request.form.get('mdp', '')
        role = request.form.get('role', 'agent')
        zone = request.form.get('zone_intervention', '').strip()

        if not valider_nom(nom):
            flash('Le nom doit contenir au moins 2 caractères.', 'danger')
            return redirect(url_for('utilisateurs.ajouter'))

        if not valider_email(email):
            flash('Veuillez entrer une adresse email valide.', 'danger')
            return redirect(url_for('utilisateurs.ajouter'))

        if not valider_mot_de_passe(mdp):
            flash('Le mot de passe doit contenir au moins 6 caractères.', 'danger')
            return redirect(url_for('utilisateurs.ajouter'))

        if Utilisateur.query.filter_by(mail=email).first():
            flash('Cet email est déjà utilisé.', 'danger')
            return redirect(url_for('utilisateurs.ajouter'))

        mdp_hash = generate_password_hash(mdp)
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
        return redirect(url_for('utilisateurs.liste'))

    return render_template('ajouter-utilisateur.html')

@utilisateurs_bp.route('/modifier/<int:id>', methods=['GET', 'POST'])
@login_required
def modifier(id):
    utilisateur = Utilisateur.query.get_or_404(id)

    if request.method == 'POST':
        nom = request.form.get('nom', '').strip()
        email = request.form.get('email', '').strip()
        mdp = request.form.get('mdp', '')
        role = request.form.get('role', 'agent')
        zone = request.form.get('zone_intervention', '').strip()

        if not valider_nom(nom):
            flash('Le nom doit contenir au moins 2 caractères.', 'danger')
            return redirect(url_for('utilisateurs.modifier', id=id))

        if not valider_email(email):
            flash('Veuillez entrer une adresse email valide.', 'danger')
            return redirect(url_for('utilisateurs.modifier', id=id))

        if Utilisateur.query.filter(Utilisateur.mail == email, Utilisateur.id_user != id).first():
            flash('Cet email est déjà utilisé par un autre utilisateur.', 'danger')
            return redirect(url_for('utilisateurs.modifier', id=id))

        utilisateur.nom_user = nom
        utilisateur.mail = email
        utilisateur.role = role
        utilisateur.zone_intervention = zone if zone else None

        if mdp:
            if not valider_mot_de_passe(mdp):
                flash('Le mot de passe doit contenir au moins 6 caractères.', 'danger')
                return redirect(url_for('utilisateurs.modifier', id=id))
            utilisateur.mdp = generate_password_hash(mdp)

        db.session.commit()
        flash('✅ Utilisateur modifié avec succès', 'success')
        return redirect(url_for('utilisateurs.liste'))

    return render_template('modifier-utilisateur.html', utilisateur=utilisateur)

@utilisateurs_bp.route('/supprimer/<int:id>')
@login_required
def supprimer(id):
    utilisateur = Utilisateur.query.get_or_404(id)

    if id == 1:
        flash('Impossible de supprimer l\'administrateur principal.', 'danger')
        return redirect(url_for('utilisateurs.liste'))

    db.session.delete(utilisateur)
    db.session.commit()
    flash('🗑️ Utilisateur supprimé avec succès', 'success')
    return redirect(url_for('utilisateurs.liste'))