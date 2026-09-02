from functools import wraps
from flask import flash, redirect, url_for, jsonify
from flask_login import current_user
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models import Utilisateur

# ==========================================================
# DÉCORATEURS POUR FLASK-LOGIN (rôles)
# ==========================================================

def admin_required(f):
    """Décorateur pour restreindre l'accès aux administrateurs"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            flash('Veuillez vous connecter.', 'warning')
            return redirect(url_for('auth.login'))
        if current_user.role != 'admin':
            flash('Accès réservé aux administrateurs.', 'danger')
            return redirect(url_for('tableau_bord'))
        return f(*args, **kwargs)
    return decorated_function

def agent_required(f):
    """Décorateur pour restreindre l'accès aux agents (ou admin)"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            flash('Veuillez vous connecter.', 'warning')
            return redirect(url_for('auth.login'))
        if current_user.role not in ['admin', 'agent']:
            flash('Accès réservé aux agents.', 'danger')
            return redirect(url_for('tableau_bord'))
        return f(*args, **kwargs)
    return decorated_function

# ==========================================================
# DÉCORATEURS POUR JWT (API)
# ==========================================================

def jwt_required_optional(f):
    """Vérifie le token JWT si présent, sinon continue (pour GET public)"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = Utilisateur.query.get(current_user_id)
            kwargs['current_user_api'] = user
        except:
            kwargs['current_user_api'] = None
        return f(*args, **kwargs)
    return decorated_function

def jwt_admin_required(f):
    """Vérifie que l'utilisateur est admin via JWT"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = Utilisateur.query.get(current_user_id)
            if not user or user.role != 'admin':
                return jsonify({'status': 'error', 'message': 'Accès administrateur requis', 'code': 403}), 403
            kwargs['current_user_api'] = user
        except:
            return jsonify({'status': 'error', 'message': 'Token invalide ou manquant', 'code': 401}), 401
        return f(*args, **kwargs)
    return decorated_function