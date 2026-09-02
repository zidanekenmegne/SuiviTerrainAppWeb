from flask import Flask, render_template, redirect, url_for, jsonify
from flask_login import LoginManager, login_required, current_user
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import Config
from models import db, Utilisateur, PointDeVente, Visite
from datetime import datetime
import requests
import os

# Import des blueprints
from blueprints.auth import auth_bp
from blueprints.points import points_bp
from blueprints.visites import visites_bp
from blueprints.categories import categories_bp
from blueprints.utilisateurs import utilisateurs_bp
from blueprints.api import api_bp, limiter

app = Flask(__name__)
app.config.from_object(Config)

# Initialisation de la base de données
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
    print("✅ Route tableau_bord appelée")
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
# GESTION DES ERREURS (API)
# ==========================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'status': 'error', 'message': 'Ressource non trouvée', 'code': 404}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'status': 'error', 'message': 'Erreur interne du serveur', 'code': 500}), 500

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