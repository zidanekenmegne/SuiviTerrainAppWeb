"""
Tests de l'authentification JWT
Vérifie la connexion, l'inscription et la protection des routes
"""

import json


class TestLogin:
    """Tests de connexion"""

    def test_login_succes(self, client, init_db):
        """Connexion réussie avec identifiants valides"""
        response = client.post('/api/v1/auth/login', json={
            'email': 'admin@test.com',
            'mdp': 'admin123'
        })
        assert response.status_code == 200

        data = response.get_json()
        assert data['status'] == 'success'
        assert 'token' in data['data']
        assert data['data']['user']['email'] == 'admin@test.com'
        assert data['data']['user']['role'] == 'admin'

    def test_login_mauvais_mdp(self, client, init_db):
        """Connexion refusée avec mauvais mot de passe"""
        response = client.post('/api/v1/auth/login', json={
            'email': 'admin@test.com',
            'mdp': 'mauvais'
        })
        assert response.status_code == 401
        assert response.get_json()['status'] == 'error'

    def test_login_email_inexistant(self, client, init_db):
        """Connexion refusée avec email inexistant"""
        response = client.post('/api/v1/auth/login', json={
            'email': 'inconnu@test.com',
            'mdp': 'admin123'
        })
        assert response.status_code == 401

    def test_login_champs_manquants(self, client, init_db):
        """Connexion refusée si champs manquants"""
        response = client.post('/api/v1/auth/login', json={
            'email': 'admin@test.com'
        })
        assert response.status_code == 400


class TestRegister:
    """Tests d'inscription"""

    def test_register_succes(self, client, init_db):
        """Inscription réussie avec données valides"""
        response = client.post('/api/v1/auth/register', json={
            'nom': 'Nouvel Utilisateur',
            'email': 'nouveau@test.com',
            'password': 'motdepasse123',
            'role': 'agent'
        })
        assert response.status_code == 201
        assert response.get_json()['status'] == 'success'

    def test_register_email_existant(self, client, init_db):
        """Inscription refusée si email existe déjà"""
        response = client.post('/api/v1/auth/register', json={
            'nom': 'Doublon',
            'email': 'admin@test.com',
            'password': 'motdepasse123',
            'role': 'agent'
        })
        assert response.status_code == 409


class TestProtectedRoutes:
    """Tests de protection des routes"""

    def test_route_protegee_sans_token(self, client, init_db):
        """Accès refusé sans token JWT"""
        response = client.get('/api/v1/points')
        # /points est public, donc 200 OK
        assert response.status_code == 200

    def test_route_admin_sans_token(self, client, init_db):
        """Accès refusé aux routes admin sans token"""
        response = client.get('/api/v1/utilisateurs')
        assert response.status_code == 401

    def test_route_admin_avec_token_agent(self, client, init_db):
        """Accès refusé aux routes admin avec token agent"""
        # Login en tant qu'agent
        login = client.post('/api/v1/auth/login', json={
            'email': 'agent@test.com',
            'mdp': 'agent123'
        })
        token = login.get_json()['data']['token']

        response = client.get(
            '/api/v1/utilisateurs',
            headers={'Authorization': f'Bearer {token}'}
        )
        assert response.status_code == 403

    def test_route_admin_avec_token_admin(self, client, auth_headers, init_db):
        """Accès autorisé aux routes admin avec token admin"""
        response = client.get('/api/v1/utilisateurs', headers=auth_headers)
        assert response.status_code == 200
        assert response.get_json()['status'] == 'success'