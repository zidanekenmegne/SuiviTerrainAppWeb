from flask import Flask, render_template, redirect, url_for, jsonify, request
from flask_login import LoginManager, login_required, current_user
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import Config
from models import db, Utilisateur, PointDeVente, Visite, Categorie
from datetime import datetime
import requests
import logging
from logging.handlers import RotatingFileHandler
import os

# Import des blueprints
from blueprints.auth import auth_bp
from blueprints.points import points_bp
from blueprints.visites import visites_bp
from blueprints.categories import categories_bp
from blueprints.utilisateurs import utilisateurs_bp
from blueprints.api import api_bp, limiter


app = Flask(__name__, static_folder='static')
app.config.from_object(Config)
CORS(app)  # Permet toutes les origines (pour développement)


# ==========================================================
# CONFIGURATION DE LA JOURNALISATION
# ==========================================================
def configure_logging(app):
    """Configure les logs applicatifs"""
    # Créer le dossier logs s'il n'existe pas
    log_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    # Format des logs
    formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
    )
    
    # Handler pour fichier (rotation : 5 Mo max, 5 backups)
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, 'suiviterrain.log'),
        maxBytes=5 * 1024 * 1024,
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.INFO)
    
    # Handler pour la console
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.INFO)
    
    # Configurer le logger de l'application
    app.logger.addHandler(file_handler)
    app.logger.addHandler(console_handler)
    app.logger.setLevel(logging.INFO)
    
    # Log de démarrage
    app.logger.info('SuiviTerrain démarré')


configure_logging(app)


# ==========================================================
# INITIALISATION DE LA BASE DE DONNÉES
# ==========================================================
db.init_app(app)


# ==========================================================
# FLASK-LOGIN (configuration)
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
# JWT (JSON Web Token)
# ==========================================================
jwt = JWTManager(app)


# ==========================================================
# CORS (Cross-Origin Resource Sharing)
# ==========================================================
CORS(app, origins=['http://localhost:3000', 'http://localhost:5173', 'https://votre-domaine.com'])


# ==========================================================
# RATE LIMITING (Limitation des requêtes)
# ==========================================================
limiter.init_app(app)


# ==========================================================
# FONCTIONS UTILITAIRES
# ==========================================================
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
@login_required
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


@app.route('/check-auth')
@login_required
def check_auth():
    return f"Connecté en tant que : {current_user.nom_user}"


@app.route('/session-check')
def session_check():
    from flask import session
    return {
        'session': dict(session),
        'user_id': session.get('_user_id'),
        'is_authenticated': current_user.is_authenticated if current_user.is_authenticated else False
    }


@app.route('/carte')
@login_required
def carte():
    categories = Categorie.query.order_by(Categorie.nom_cat).all()
    
    # Récupérer les zones uniques des utilisateurs
    zones = db.session.query(Utilisateur.zone_intervention)\
        .filter(Utilisateur.zone_intervention.isnot(None))\
        .distinct()\
        .order_by(Utilisateur.zone_intervention)\
        .all()
    zones = [z[0] for z in zones if z[0]]
    
    today = datetime.now().date().isoformat()
    
    return render_template('carte.html', 
        categories=categories, 
        zones=zones,
        today=today
    )


# ==========================================================
# GESTION DES ERREURS
# ==========================================================

@app.errorhandler(404)
def not_found(error):
    """Gestion des 404 : API JSON ou page HTML selon la route"""
    if request.path.startswith('/api/'):
        return jsonify({'status': 'error', 'message': 'Ressource non trouvée', 'code': 404}), 404
    return render_template('errors/404.html'), 404


@app.errorhandler(500)
def internal_error(error):
    """Gestion des 500 : API JSON ou page HTML selon la route"""
    db.session.rollback()
    if request.path.startswith('/api/'):
        return jsonify({'status': 'error', 'message': 'Erreur interne du serveur', 'code': 500}), 500
    return render_template('errors/500.html'), 500


# ==========================================================
# ENREGISTREMENT DES BLUEPRINTS
# ==========================================================

app.register_blueprint(auth_bp)
app.register_blueprint(points_bp)
app.register_blueprint(visites_bp)
app.register_blueprint(categories_bp)
app.register_blueprint(utilisateurs_bp)
app.register_blueprint(api_bp)  # ← API REST


# ==========================================================
# POINT D'ENTRÉE
# ==========================================================

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Créer le dossier uploads s'il n'existe pas
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=5000)