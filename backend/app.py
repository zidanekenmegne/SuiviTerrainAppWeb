"""
Application SuiviTerrain
Point d'entrée principal — Flask + PostgreSQL

Ce module initialise :
    - L'application Flask
    - La base de données PostgreSQL
    - L'authentification (JWT + Flask-Login)
    - Les blueprints (API REST + routes HTML)
    - La journalisation applicative
    - La gestion des erreurs
"""

import logging
import os
from datetime import datetime
from logging.handlers import RotatingFileHandler

# ==========================================================
# CONVERSION DE L'URL POSTGRESQL (AVANT tout import de Config)
# ==========================================================
# Render fournit postgres:// mais SQLAlchemy attend postgresql://
database_url = os.environ.get('DATABASE_URL', '')
if database_url.startswith('postgres://'):
    os.environ['DATABASE_URL'] = database_url.replace('postgres://', 'postgresql://', 1)

# Vérification : la variable doit être définie
if not os.environ.get('DATABASE_URL'):
    print("ATTENTION : DATABASE_URL n'est pas définie dans les variables d'environnement")
# Log de diagnostic (à retirer après résolution)
print(f"DIAGNOSTIC - Variables d'environnement disponibles :")
for key in sorted(os.environ.keys()):
    if 'DATABASE' in key or 'SECRET' in key or 'JWT' in key or 'FRONTEND' in key:
        value = os.environ[key]
        # Masquer les secrets
        if 'SECRET' in key or 'JWT' in key or 'DATABASE' in key:
            value = value[:20] + '...' if len(value) > 20 else value
        print(f"  {key} = {value}")

import requests
from flask import Flask, jsonify, redirect, render_template, request, url_for
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_login import LoginManager, current_user, login_required

# Import de Config APRÈS la conversion
from config import Config
from models import Categorie, PointDeVente, Utilisateur, Visite, db

# Blueprints
from blueprints.api import api_bp, limiter
from blueprints.auth import auth_bp
from blueprints.categories import categories_bp
from blueprints.points import points_bp
from blueprints.utilisateurs import utilisateurs_bp
from blueprints.visites import visites_bp


# ==========================================================
# INITIALISATION DE L'APPLICATION
# ==========================================================

app = Flask(__name__, static_folder='static')
app.config.from_object(Config)


# ==========================================================
# JOURNALISATION
# ==========================================================

def configure_logging(application):
    """
    Configure la journalisation applicative avec rotation de fichiers.
    - Fichier : logs/suiviterrain.log
    - Rotation : 5 Mo max, 5 backups conservés
    """
    log_dir = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        'logs'
    )
    os.makedirs(log_dir, exist_ok=True)

    formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
    )

    file_handler = RotatingFileHandler(
        os.path.join(log_dir, 'suiviterrain.log'),
        maxBytes=5 * 1024 * 1024,
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.INFO)

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.INFO)

    application.logger.addHandler(file_handler)
    application.logger.addHandler(console_handler)
    application.logger.setLevel(logging.INFO)

    application.logger.info('SuiviTerrain démarré')


configure_logging(app)


# ==========================================================
# BASE DE DONNÉES
# ==========================================================

db.init_app(app)


# ==========================================================
# AUTHENTIFICATION — FLASK-LOGIN (pages HTML)
# ==========================================================

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'
login_manager.login_message = 'Veuillez vous connecter pour accéder à cette page.'
login_manager.login_message_category = 'warning'


@login_manager.user_loader
def load_user(user_id):
    return Utilisateur.query.get(int(user_id))


# ==========================================================
# AUTHENTIFICATION — JWT (API REST)
# ==========================================================

jwt = JWTManager(app)


# ==========================================================
# CORS — Sécurisé
# ==========================================================
# Seules les origines explicitement autorisées peuvent appeler l'API.
# En développement : localhost (Vite).
# En production : ajouter le domaine réel (ex. suiviterrain.vercel.app).

ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5174',
]

# En production, la variable d'environnement FRONTEND_URL doit être définie.
production_origin = os.environ.get('FRONTEND_URL')
if production_origin:
    ALLOWED_ORIGINS.append(production_origin)

CORS(
    app,
    origins=ALLOWED_ORIGINS,
    supports_credentials=True,
    allow_headers=['Content-Type', 'Authorization'],
    methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
)


# ==========================================================
# RATE LIMITING
# ==========================================================

limiter.init_app(app)


# ==========================================================
# FONCTIONS UTILITAIRES
# ==========================================================

def geocoder_adresse(adresse):
    """
    Convertit une adresse en coordonnées GPS via Nominatim (OpenStreetMap).

    Args:
        adresse (str): Adresse à géocoder.

    Returns:
        dict | None: {'latitude': float, 'longitude': float} ou None si échec.
    """
    try:
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "q": adresse,
            "format": "json",
            "limit": 1,
            "accept-language": "fr"
        }
        headers = {"User-Agent": "SuiviTerrainApp/1.0"}

        response = requests.get(url, params=params, headers=headers, timeout=5)

        if response.status_code == 200:
            data = response.json()
            if data:
                return {
                    "latitude": float(data[0]["lat"]),
                    "longitude": float(data[0]["lon"])
                }
        return None
    except Exception as exc:
        app.logger.warning(f"Géocodage échoué pour « {adresse} » : {exc}")
        return None


# ==========================================================
# ROUTES HTML (templates Jinja2)
# ==========================================================

@app.route('/')
def index():
    """Redirige vers le tableau de bord."""
    return redirect(url_for('tableau_bord'))


@app.route('/tableau-bord')
@login_required
def tableau_bord():
    """Page HTML du tableau de bord (ancienne interface Jinja2)."""
    total_visites = Visite.query.count()
    total_realisees = Visite.query.filter_by(statut='realisee').count()
    total_encours = Visite.query.filter_by(statut='encours').count()
    total_attente = Visite.query.filter_by(statut='attente').count()

    visites_recentes = (
        Visite.query
        .order_by(Visite.date_creation.desc())
        .limit(5)
        .all()
    )

    date_actuelle = datetime.now().strftime('%d %B %Y')

    return render_template(
        'tableau-bord.html',
        total_visites=total_visites,
        total_realisees=total_realisees,
        total_encours=total_encours,
        total_attente=total_attente,
        visites_recentes=visites_recentes,
        date_actuelle=date_actuelle
    )


@app.route('/check-auth')
@login_required
def check_auth():
    """Vérifie l'état d'authentification (debug)."""
    return f"Connecté en tant que : {current_user.nom_user}"


@app.route('/session-check')
def session_check():
    """Retourne l'état de la session courante (debug)."""
    from flask import session
    return {
        'session': dict(session),
        'user_id': session.get('_user_id'),
        'is_authenticated': current_user.is_authenticated if current_user.is_authenticated else False
    }


@app.route('/carte')
@login_required
def carte():
    """Page HTML de la carte (ancienne interface Jinja2)."""
    categories = Categorie.query.order_by(Categorie.nom_cat).all()

    zones_query = (
        db.session.query(Utilisateur.zone_intervention)
        .filter(Utilisateur.zone_intervention.isnot(None))
        .distinct()
        .order_by(Utilisateur.zone_intervention)
        .all()
    )
    zones = [z[0] for z in zones_query if z[0]]

    today = datetime.now().date().isoformat()

    return render_template(
        'carte.html',
        categories=categories,
        zones=zones,
        today=today
    )


# ==========================================================
# GESTION DES ERREURS
# ==========================================================

@app.errorhandler(404)
def not_found(error):
    """Gestion des 404 : réponse JSON pour /api, page HTML sinon."""
    if request.path.startswith('/api/'):
        return jsonify({
            'status': 'error',
            'message': 'Ressource non trouvée',
            'code': 404
        }), 404
    return render_template('errors/404.html'), 404


@app.errorhandler(500)
def internal_error(error):
    """
    Gestion des 500 : en production, ne jamais exposer la trace d'erreur.
    Un identifiant de corrélation est généré et loggé côté serveur.
    """
    import uuid

    db.session.rollback()
    error_id = uuid.uuid4().hex[:8]
    app.logger.error(f"[{error_id}] Erreur interne : {error}")

    if app.config.get('DEBUG'):
        message = f'Erreur : {str(error)}'
    else:
        message = f'Erreur interne du serveur (référence : {error_id})'

    if request.path.startswith('/api/'):
        return jsonify({
            'status': 'error',
            'message': message,
            'code': 500
        }), 500
    return render_template('errors/500.html'), 500

@app.route('/api/v1/admin/init-db')
def init_db_route():
    from flask import request
    token = request.args.get('token')
    if token != os.environ.get('SECRET_KEY'):
        return jsonify({'error': 'unauthorized'}), 401
    
    with app.app_context():
        db.create_all()
        
        # Créer l'admin si absent
        from werkzeug.security import generate_password_hash
        if Utilisateur.query.filter_by(mail='admin@suiviterrain.com').first() is None:
            admin = Utilisateur(
                nom_user='Admin',
                mail='admin@suiviterrain.com',
                mdp=generate_password_hash('admin123'),
                role='admin',
                actif=True
            )
            db.session.add(admin)
            db.session.commit()
            return jsonify({'status': 'admin créé'})
        return jsonify({'status': 'admin existe déjà'})
# ==========================================================
# ENREGISTREMENT DES BLUEPRINTS
# ==========================================================

app.register_blueprint(auth_bp)
app.register_blueprint(points_bp)
app.register_blueprint(visites_bp)
app.register_blueprint(categories_bp)
app.register_blueprint(utilisateurs_bp)
app.register_blueprint(api_bp)


# ==========================================================
# POINT D'ENTRÉE
# ==========================================================

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    app.run(debug=True, host='0.0.0.0', port=5000)