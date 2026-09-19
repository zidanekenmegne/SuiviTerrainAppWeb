"""
Tests des notifications
Vérifie la création, la lecture et les actions
"""


class TestNotifications:
    """Tests des notifications"""

    def test_liste_notifications_vide(self, client, auth_headers, init_db):
        """La liste des notifications est vide au départ"""
        response = client.get('/api/v1/notifications', headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        assert data['data']['total'] == 0
        assert data['data']['non_lues'] == 0

    def test_notifications_sans_token(self, client, init_db):
        """La liste des notifications est protégée"""
        response = client.get('/api/v1/notifications')
        assert response.status_code == 401

    def test_marquer_tout_comme_lu(self, client, auth_headers, init_db):
        """Marquer toutes les notifications comme lues"""
        response = client.put('/api/v1/notifications/tout-lu', headers=auth_headers)
        assert response.status_code == 200
        assert response.get_json()['status'] == 'success'