"""
Tests des visites
Vérifie la création, la lecture et les contraintes
"""

from datetime import date, timedelta


class TestGetVisites:
    """Tests de lecture des visites"""

    def test_liste_visites_authentifie(self, client, auth_headers, init_db):
        """La liste des visites nécessite un token"""
        response = client.get('/api/v1/visites', headers=auth_headers)
        assert response.status_code == 200
        assert response.get_json()['status'] == 'success'

    def test_liste_visites_sans_token(self, client, init_db):
        """La liste des visites est protégée"""
        response = client.get('/api/v1/visites')
        assert response.status_code == 401


class TestCreateVisite:
    """Tests de création d'une visite"""

    def test_creation_visite_valide(self, client, auth_headers, init_db):
        """Création d'une visite avec données valides"""
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        
        # ✅ Utilise les IDs retournés par init_db
        point_id = init_db['point_id']
        agent_id = init_db['agent_id']
        
        response = client.post(
            '/api/v1/visites',
            json={
                'date_prevue': tomorrow,
                'heure_prevue': '10:00',
                'point_vente_id': init_db['point_id'],   # ← ✅ ID réel
                'agent_id': init_db['agent_id'],        # ← Utilise la vraie valeur
                'statut': 'planifiee'
            },
            headers=auth_headers
        )
        assert response.status_code == 201
        assert response.get_json()['status'] == 'success'

class TestStats:
    """Tests des statistiques"""

    def test_stats_authentifie(self, client, auth_headers, init_db):
        """Les statistiques sont accessibles avec token"""
        response = client.get('/api/v1/stats', headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        assert 'visites' in data['data']

    def test_stats_sans_token(self, client, init_db):
        """Les statistiques sont protégées"""
        response = client.get('/api/v1/stats')
        assert response.status_code == 401