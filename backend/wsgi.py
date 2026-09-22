"""
Point d'entrée WSGI pour la production
Utilisé par Gunicorn (Linux) et Waitress (Windows)

Usage en production :
    gunicorn --config gunicorn.conf.py wsgi:app    (Linux)
    python run_prod_windows.py                     (Windows)
"""

import os
from app import app
from models import db


# ==========================================================
# Initialisation de la base de données au démarrage
# ==========================================================
with app.app_context():
    db.create_all()
    
    # Créer le dossier uploads s'il n'existe pas
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    app.logger.info('WSGI app initialisée')


# ==========================================================
# Point d'entrée (dev uniquement)
# ==========================================================
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)