"""
Configuration pytest pour SuiviTerrain
- Utilise une base de données de test séparée
- Crée les tables avant les tests
- Détruit les tables après les tests
"""

import pytest
from app import app as flask_app
from models import db, Utilisateur, Categorie, PointDeVente, Visite, Notification, JournalConnexion
from config import TestConfig
from werkzeug.security import generate_password_hash
from datetime import datetime


@pytest.fixture(scope='session')
def app():
    """Instance Flask configurée pour les tests"""
    flask_app.config.from_object(TestConfig)
    
    db_uri = flask_app.config['SQLALCHEMY_DATABASE_URI']
    if '_test' not in db_uri.lower():
        raise RuntimeError(
            f"\n{'='*70}\n"
            f"🚨🚨🚨  DANGER MORTEL  🚨🚨🚨\n"
            f"{'='*70}\n\n"
            f"Les tests tentent de tourner sur la base de PRODUCTION !\n\n"
            f"URI configurée : {db_uri}\n\n"
            f"Le nom de la base DOIT contenir '_test'.\n"
            f"Corrigez TestConfig.SQLALCHEMY_DATABASE_URI dans config.py.\n\n"
            f"Cette sécurité empêche db.drop_all() de détruire vos données.\n"
            f"{'='*70}\n"
        )
    
    # Confirmation visuelle dans la console
    print(f"\n{'='*70}")
    print(f" Tests sur la base : {db_uri.split('/')[-1]}")
    print(f"{'='*70}\n")
    
    with flask_app.app_context():
        db.create_all()
        yield flask_app
        db.session.remove()
        db.drop_all()


@pytest.fixture(scope='function')
def client(app):
    """Client de test HTTP"""
    return app.test_client()


@pytest.fixture(scope='function')
def runner(app):
    """Runner CLI Flask"""
    return app.test_cli_runner()


@pytest.fixture(scope='function')
def init_db(app):
    """Initialise la base avec des données de test"""
    with app.app_context():
        # ✅ Rollback de sécurité
        db.session.rollback()
        
        # ==========================================================
        # NETTOYAGE DANS LE BON ORDRE (filles → mères)
        # ==========================================================
        # 1. Tables qui référencent utilisateur
        db.session.query(Notification).delete()
        db.session.query(JournalConnexion).delete()
        
        # 2. Table d'association AVANT visite
        db.session.execute(db.text('DELETE FROM realiser'))
        
        # 3. Visite (référence point_de_vente)
        db.session.query(Visite).delete()
        
        # 4. Point de vente (référence categorie)
        db.session.query(PointDeVente).delete()
        
        # 5. Catégorie (indépendante)
        db.session.query(Categorie).delete()
        
        # 6. Utilisateur (en dernier)
        db.session.query(Utilisateur).delete()
        
        db.session.commit()
        
        # ==========================================================
        # CRÉATION DES DONNÉES DE TEST
        # ==========================================================
        
        # Admin
        admin = Utilisateur(
            nom_user='Admin Test',
            mail='admin@test.com',
            mdp=generate_password_hash('admin123'),
            role='admin',
            actif=True,
            date_creation_user=datetime.now()
        )
        db.session.add(admin)
        
        # Agent
        agent = Utilisateur(
            nom_user='Agent Test',
            mail='agent@test.com',
            mdp=generate_password_hash('agent123'),
            role='agent',
            actif=True,
            date_creation_user=datetime.now()
        )
        db.session.add(agent)
        
        # Catégorie
        categorie = Categorie(
            nom_cat='Alimentation',
            couleur='#28a745',
            date_creation_cat=datetime.now()
        )
        db.session.add(categorie)
        db.session.commit()
        
        # Point de vente
        point = PointDeVente(
            nom_pt='Magasin Test',
            adresse='123 Rue de Test, Douala',
            telephone='699999999',
            id_cat=categorie.id_cat,
            date_creation_pt=datetime.now()
        )
        db.session.add(point)
        db.session.commit()
        
        # Retourner les IDs pour les tests
        ids = {
            'admin_id': admin.id_user,
            'agent_id': agent.id_user,
            'categorie_id': categorie.id_cat,
            'point_id': point.id_pt,
            'admin_email': 'admin@test.com',
            'agent_email': 'agent@test.com',
        }
        
        yield ids


@pytest.fixture(scope='function')
def auth_headers(client, init_db):
    """Retourne les headers d'authentification JWT pour l'admin"""
    response = client.post('/api/v1/auth/login', json={
        'email': 'admin@test.com',
        'mdp': 'admin123'
    })
    
    data = response.get_json()
    if not data or 'data' not in data or 'token' not in data.get('data', {}):
        raise RuntimeError(
            f"Login failed in auth_headers. Status: {response.status_code}, "
            f"Body: {response.data.decode()}"
        )
    
    token = data['data']['token']
    return {'Authorization': f'Bearer {token}'}