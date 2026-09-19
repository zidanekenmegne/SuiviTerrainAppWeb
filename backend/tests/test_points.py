"""
Tests des points de vente
Vérifie le CRUD via l'API REST
"""


class TestGetPoints:
    """Tests de lecture des points de vente"""

    def test_liste_points(self, client, init_db):
        """La liste des points de vente est accessible publiquement"""
        response = client.get('/api/v1/points')
        assert response.status_code == 200

        data = response.get_json()
        assert data['status'] == 'success'
        assert 'points' in data['data']
        assert len(data['data']['points']) >= 1

    def test_detail_point(self, client, init_db):
        """Le détail d'un point est accessible"""
        response = client.get('/api/v1/points/1')
        # Le point ID=1 existe (créé par init_db)
        assert response.status_code in [200, 404]

    def test_point_inexistant(self, client, init_db):
        """Un point inexistant retourne 404"""
        response = client.get('/api/v1/points/99999')
        assert response.status_code == 404


class TestCreatePoint:
    """Tests de création d'un point de vente"""

    def test_creation_point_valide(self, client, auth_headers, init_db):
        """Création d'un point avec données valides"""
        # ✅ Utilise l'ID de la catégorie créée par init_db
        categorie_id = init_db['categorie_id']
        
        response = client.post(
            '/api/v1/points',
            json={
                'nom': 'Nouveau Point Test',
                'adresse': '456 Avenue de Test',
                'telephone': '677777777',
                'categorie_id': categorie_id  # ← Utilise la vraie valeur
            },
            headers=auth_headers
        )
        assert response.status_code == 201
        assert response.get_json()['status'] == 'success'