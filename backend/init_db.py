"""
Script d'initialisation de la base de données SuiviTerrain
Crée toutes les tables puis insère les données de base.

Usage :
    python init_db.py
"""

from app import app
from models import db
import os


def init_database():
    with app.app_context():
        print("Création des tables...")
        db.create_all()
        print("Tables créées avec succès.")

        # Créer le dossier uploads s'il n'existe pas
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

        # Vérifier les tables
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()

        print(f"\nTables présentes ({len(tables)}) :")
        for table in tables:
            print(f"  - {table}")


if __name__ == '__main__':
    init_database()