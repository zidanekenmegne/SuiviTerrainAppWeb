"""
Script de peuplement de la base de données SuiviTerrain
Insère un admin, un agent, des catégories et des points de vente.

Usage :
    python seed_data.py
"""

from app import app
from models import db, Utilisateur, Categorie, PointDeVente, Visite
from werkzeug.security import generate_password_hash
from datetime import datetime


def seed():
    with app.app_context():
        # ==========================================================
        # UTILISATEURS
        # ==========================================================
        if Utilisateur.query.count() == 0:
            admin = Utilisateur(
                nom_user='Admin SuiviTerrain',
                mail='admin@suiviterrain.com',
                mdp=generate_password_hash('admin123'),
                role='admin',
                actif=True,
                date_creation_user=datetime.now()
            )
            db.session.add(admin)

            agent = Utilisateur(
                nom_user='Agent Test',
                mail='agent@suiviterrain.com',
                mdp=generate_password_hash('agent123'),
                role='agent',
                actif=True,
                date_creation_user=datetime.now()
            )
            db.session.add(agent)
            db.session.commit()
            print("Utilisateurs créés")
        else:
            print("Utilisateurs déjà présents")

        # ==========================================================
        # CATÉGORIES
        # ==========================================================
        if Categorie.query.count() == 0:
            categories = [
                Categorie(nom_cat='Alimentation', couleur='#28a745', date_creation_cat=datetime.now()),
                Categorie(nom_cat='Services', couleur='#007bff', date_creation_cat=datetime.now()),
                Categorie(nom_cat='Vêtement', couleur='#ffc107', date_creation_cat=datetime.now()),
                Categorie(nom_cat='Électronique', couleur='#dc3545', date_creation_cat=datetime.now()),
                Categorie(nom_cat='Immobilier', couleur='#6f42c1', date_creation_cat=datetime.now()),
            ]
            for c in categories:
                db.session.add(c)
            db.session.commit()
            print("Catégories créées")
        else:
            print("Catégories déjà présentes")

        # ==========================================================
        # POINTS DE VENTE
        # ==========================================================
        if PointDeVente.query.count() == 0:
            cat_alim = Categorie.query.filter_by(nom_cat='Alimentation').first()
            cat_serv = Categorie.query.filter_by(nom_cat='Services').first()

            points = [
                PointDeVente(
                    nom_pt='Magasin A - Centre-ville',
                    adresse='123 Rue de Paris, Douala',
                    latitude=4.051056,
                    longitude=9.767869,
                    telephone='699999999',
                    id_cat=cat_alim.id_cat if cat_alim else None,
                    date_creation_pt=datetime.now()
                ),
                PointDeVente(
                    nom_pt='Client B - Bonamoussadi',
                    adresse='45 Avenue de l\'Indépendance, Douala',
                    latitude=4.058300,
                    longitude=9.738600,
                    telephone='688888888',
                    id_cat=cat_serv.id_cat if cat_serv else None,
                    date_creation_pt=datetime.now()
                ),
                PointDeVente(
                    nom_pt='Magasin C - Akwa',
                    adresse='78 Rue Joss, Douala',
                    latitude=4.045600,
                    longitude=9.692300,
                    telephone='677777777',
                    id_cat=cat_alim.id_cat if cat_alim else None,
                    date_creation_pt=datetime.now()
                ),
            ]
            for p in points:
                db.session.add(p)
            db.session.commit()
            print("Points de vente créés")
        else:
            print("Points de vente déjà présents")

        # ==========================================================
        # RÉCAPITULATIF
        # ==========================================================
        print(f"\n{'='*50}")
        print("État de la base :")
        print(f"   Utilisateurs : {Utilisateur.query.count()}")
        print(f"   Catégories   : {Categorie.query.count()}")
        print(f"   Points       : {PointDeVente.query.count()}")
        print(f"   Visites      : {Visite.query.count()}")
        print(f"{'='*50}")


if __name__ == '__main__':
    seed()