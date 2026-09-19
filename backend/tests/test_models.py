"""
Tests des modèles SQLAlchemy
Vérifie la création, la lecture et les relations entre entités
"""

from models import db, Utilisateur, Categorie, PointDeVente, Visite, Notification
from werkzeug.security import generate_password_hash
from datetime import datetime, date, time


class TestUtilisateur:
    """Tests du modèle Utilisateur"""

    def test_creation_utilisateur(self, app):
        """Un utilisateur peut être créé et lu"""
        with app.app_context():
            user = Utilisateur(
                nom_user='Test User',
                mail='test@example.com',
                mdp=generate_password_hash('password123'),
                role='agent',
                actif=True,
                date_creation_user=datetime.now()
            )
            db.session.add(user)
            db.session.commit()

            found = Utilisateur.query.filter_by(mail='test@example.com').first()
            assert found is not None
            assert found.nom_user == 'Test User'
            assert found.role == 'agent'
            assert found.actif is True

    def test_password_hache(self, app):
        """Le mot de passe est bien haché"""
        with app.app_context():
            from werkzeug.security import check_password_hash

            user = Utilisateur(
                nom_user='Hash Test',
                mail='hash@test.com',
                mdp=generate_password_hash('secret'),
                role='agent',
                actif=True
            )
            db.session.add(user)
            db.session.commit()

            found = Utilisateur.query.filter_by(mail='hash@test.com').first()
            assert found.mdp != 'secret'
            assert check_password_hash(found.mdp, 'secret') is True
            assert check_password_hash(found.mdp, 'wrong') is False


class TestCategorie:
    """Tests du modèle Categorie"""

    def test_creation_categorie(self, app):
        """Une catégorie peut être créée avec une couleur"""
        with app.app_context():
            cat = Categorie(
                nom_cat='Test Cat',
                couleur='#FF0000',
                date_creation_cat=datetime.now()
            )
            db.session.add(cat)
            db.session.commit()

            found = Categorie.query.filter_by(nom_cat='Test Cat').first()
            assert found is not None
            assert found.couleur == '#FF0000'


class TestPointDeVente:
    """Tests du modèle PointDeVente"""

    def test_point_lie_a_categorie(self, app, init_db):
        """Un point de vente est lié à une catégorie"""
        with app.app_context():
            point = PointDeVente.query.first()
            assert point is not None
            assert point.categorie is not None
            assert point.categorie.nom_cat == 'Alimentation'

    def test_latitude_nullable(self, app):
        """La latitude peut être NULL"""
        with app.app_context():
            point = PointDeVente(
                nom_pt='Point sans GPS',
                adresse='Adresse inconnue',
                latitude=None,
                longitude=None,
                date_creation_pt=datetime.now()
            )
            db.session.add(point)
            db.session.commit()

            found = PointDeVente.query.filter_by(nom_pt='Point sans GPS').first()
            assert found.latitude is None
            assert found.longitude is None


class TestVisite:
    """Tests du modèle Visite"""

    def test_creation_visite(self, app, init_db):
        """Une visite peut être créée avec un statut valide"""
        with app.app_context():
            point = PointDeVente.query.first()

            visite = Visite(
                date_prevue=date.today(),
                heure_prevue=time(10, 0),
                id_pt=point.id_pt,
                statut='planifiee',
                date_creation=datetime.now()
            )
            db.session.add(visite)
            db.session.commit()

            found = Visite.query.first()
            assert found is not None
            assert found.statut == 'planifiee'
            assert found.point.nom_pt == 'Magasin Test'