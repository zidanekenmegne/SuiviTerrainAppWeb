from flask import Blueprint, render_template, request, redirect, url_for, flash
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user, login_required, current_user
from models import db, Utilisateur, JournalConnexion
from datetime import datetime
import re

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# ==========================================================
# FONCTIONS DE VALIDATION
# ==========================================================

def valider_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def valider_mot_de_passe(mdp):
    return len(mdp) >= 6

def valider_nom(nom):
    return nom and len(nom.strip()) >= 2

# ==========================================================
# ROUTES D'AUTHENTIFICATION
# ==========================================================

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        mdp = request.form.get('mdp', '')

        if not email or not mdp:
            flash('Veuillez remplir tous les champs.', 'danger')
            return render_template('login.html')

        user = Utilisateur.query.filter_by(mail=email).first()

        if user:
            try:
                password_valid = check_password_hash(user.mdp, mdp)
            except ValueError:
                flash('Votre mot de passe doit être réinitialisé. Contactez l\'administrateur.', 'danger')
                return render_template('login.html')
        else:
            password_valid = False

        if user and password_valid:
            login_user(user)
            print(f" Utilisateur connecté : {user.nom_user} (ID: {user.id_user})")
            print(f" Session ID : {request.cookies.get('session')}")
            user.derniere_connexion_user = datetime.now()
            db.session.commit()

            # Journal de connexion
            journal = JournalConnexion(
                id_user=user.id_user,
                adresse_ip=request.remote_addr,
                horodatage=datetime.now()
            )
            db.session.add(journal)
            db.session.commit()

            flash(f'Bienvenue {user.nom_user} !', 'success')
            
            # Redirection CORRIGÉE
            next_page = request.args.get('next')
            if next_page:
                return redirect(next_page)
            
            # Redirection vers le tableau de bord
            return redirect(url_for('tableau_bord'))
        else:
            flash('Email ou mot de passe incorrect.', 'danger')

    return render_template('login.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Vous avez été déconnecté.', 'info')
    return redirect(url_for('auth.login'))

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        nom = request.form.get('nom', '').strip()
        email = request.form.get('email', '').strip()
        mdp = request.form.get('mdp', '')
        role = request.form.get('role', 'agent')
        zone = request.form.get('zone_intervention', '').strip()

        if not valider_nom(nom):
            flash('Le nom doit contenir au moins 2 caractères.', 'danger')
            return render_template('register.html')

        if not valider_email(email):
            flash('Veuillez entrer une adresse email valide.', 'danger')
            return render_template('register.html')

        if not valider_mot_de_passe(mdp):
            flash('Le mot de passe doit contenir au moins 6 caractères.', 'danger')
            return render_template('register.html')

        if Utilisateur.query.filter_by(mail=email).first():
            flash('Cet email est déjà utilisé.', 'danger')
            return render_template('register.html')

        mdp_hash = generate_password_hash(mdp)
        nouvel_utilisateur = Utilisateur(
            nom_user=nom,
            mail=email,
            mdp=mdp_hash,
            role=role,
            zone_intervention=zone if zone else None,
            date_creation_user=datetime.now(),
            actif=True
        )

        db.session.add(nouvel_utilisateur)
        db.session.commit()

        flash('Compte créé avec succès ! Connectez-vous.', 'success')
        return redirect(url_for('auth.login'))

    return render_template('register.html')

@auth_bp.route('/profile')
@login_required
def profile():
    return render_template('profile.html', user=current_user)