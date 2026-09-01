from flask import Flask, render_template, redirect, url_for
from flask_login import LoginManager, login_required, current_user
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

app = Flask(__name__)
app.config.from_object(Config)

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
# FONCTIONS UTILITAIRES
# ==========================================================

def geocoder_adresse(adresse):
    try:
        url = "https://nominatim.openstreetmap.org/search"
        params = {"q": adresse, "format": "json", "limit": 1, "accept-language": "fr"}
        headers = {"User-Agent": "SuiviTerrainApp/1.0"}
        response = requests.get(url, params=params, headers=headers, timeout=5)
        if response.status_code == 200 and response.json():
            data = response.json()
            return {"latitude": float(data[0]["lat"]), "longitude": float(data[0]["lon"])}
        return None
    except:
        return None

# ==========================================================
# ROUTE PRINCIPALE (tableau de bord)
# ==========================================================

@app.route('/')
def index():
    return redirect(url_for('tableau_bord'))

@app.route('/tableau-bord')
@login_required
def tableau_bord():
    total_visites = Visite.query.count()
    total_realisees = Visite.query.filter_by(statut='realisee').count()
    total_encours = Visite.query.filter_by(statut='encours').count()
    total_attente = Visite.query.filter_by(statut='attente').count()
    visites_recentes = Visite.query.order_by(Visite.date_creation.desc()).limit(5).all()
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
# ENREGISTREMENT DES BLUEPRINTS
# ==========================================================

app.register_blueprint(auth_bp)
app.register_blueprint(points_bp)
app.register_blueprint(visites_bp)
app.register_blueprint(categories_bp)
app.register_blueprint(utilisateurs_bp)

# ==========================================================
# POINT D'ENTRÉE
# ==========================================================

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=5000)