from flask import Blueprint, request, jsonify, url_for
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_cors import cross_origin
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from models import db, Utilisateur, Categorie, PointDeVente, Visite
from datetime import datetime, timedelta
from sqlalchemy import desc

api_bp = Blueprint('api', __name__, url_prefix='/api/v1')

# ==========================================================
# LIMITEUR DE REQUÊTES
# ==========================================================
limiter = Limiter(key_func=get_remote_address)

# ==========================================================
# FONCTION DE RÉPONSE UNIFORME
# ==========================================================
def api_response(data=None, message=None, status='success', code=200):
    response = {'status': status}
    if message:
        response['message'] = message
    if data is not None:
        response['data'] = data
    return jsonify(response), code

# ==========================================================
# ROUTE DE TEST (sans authentification)
# ==========================================================
@api_bp.route('/test', methods=['GET'])
@cross_origin()
def api_test():
    """Route de test - sans authentification"""
    return jsonify({
        'status': 'success',
        'message': 'API SuiviTerrain fonctionne !',
        'data': {
            'visites': [
                {'id': 1, 'titre': 'Visite test 1', 'date': '2026-09-12'},
                {'id': 2, 'titre': 'Visite test 2', 'date': '2026-09-13'}
            ],
            'points': [
                {'id': 1, 'nom': 'Magasin Test 1', 'adresse': 'Douala'},
                {'id': 2, 'nom': 'Magasin Test 2', 'adresse': 'Yaoundé'}
            ]
        }
    })

# ==========================================================
# 1. AUTHENTIFICATION (JWT)
# ==========================================================

@api_bp.route('/auth/login', methods=['POST'])
@limiter.limit("10 per minute")
def api_login():
    """Authentification et génération de token JWT"""
    data = request.get_json()
    email = data.get('email')
    mdp = data.get('mdp')
    
    if not email or not mdp:
        return api_response(message='Email et mot de passe requis', status='error', code=400)
    
    user = Utilisateur.query.filter_by(mail=email).first()
    
    if not user:
        return api_response(message='Email ou mot de passe incorrect', status='error', code=401)
    
    from werkzeug.security import check_password_hash
    if not check_password_hash(user.mdp, mdp):
        return api_response(message='Email ou mot de passe incorrect', status='error', code=401)
    
    if not user.actif:
        return api_response(message='Compte désactivé', status='error', code=403)
    
    # Création du token JWT
    access_token = create_access_token(
        identity=str(user.id_user),
        expires_delta=timedelta(days=7)
    )
    
    return api_response(
        data={
            'token': access_token,
            'user': {
                'id': user.id_user,
                'nom': user.nom_user,
                'email': user.mail,
                'role': user.role
            }
        },
        message='Authentification réussie'
    )

@api_bp.route('/auth/refresh', methods=['POST'])
@jwt_required()
def api_refresh():
    """Rafraîchir le token JWT"""
    current_user_id = get_jwt_identity()
    new_token = create_access_token(identity=str(current_user_id), expires_delta=timedelta(days=7))
    return api_response(data={'token': new_token}, message='Token rafraîchi')

# ==========================================================
# 2. CATÉGORIES (public)
# ==========================================================

@api_bp.route('/categories', methods=['GET'])
@cross_origin()
def api_get_categories():
    """Liste des catégories (public)"""
    categories = Categorie.query.order_by(Categorie.nom_cat).all()
    return api_response(data=[{
        'id': c.id_cat,
        'nom': c.nom_cat,
        'couleur': c.couleur,
        'nombre_points': len(c.points)
    } for c in categories])

# ==========================================================
# 3. POINTS DE VENTE
# ==========================================================

@api_bp.route('/points', methods=['GET'])
@limiter.limit("100 per minute")
@cross_origin()
def api_get_points():
    """Liste des points de vente (public)"""
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    search = request.args.get('search', '').strip()
    categorie = request.args.get('categorie', '').strip()
    
    query = PointDeVente.query
    
    if search:
        query = query.filter(
            (PointDeVente.nom_pt.ilike(f'%{search}%')) |
            (PointDeVente.adresse.ilike(f'%{search}%'))
        )
    
    if categorie:
        query = query.join(Categorie).filter(Categorie.nom_cat.ilike(f'%{categorie}%'))
    
    total = query.count()
    points = query.order_by(PointDeVente.nom_pt).offset((page - 1) * limit).limit(limit).all()
    
    return api_response(data={
        'points': [{
            'id': p.id_pt,
            'nom': p.nom_pt,
            'adresse': p.adresse,
            'latitude': float(p.latitude) if p.latitude else None,
            'longitude': float(p.longitude) if p.longitude else None,
            'telephone': p.telephone,
            'photo': p.photo,
            'categorie': p.categorie.nom_cat if p.categorie else None,
            'couleur': p.categorie.couleur if p.categorie else None,
            'date_creation': p.date_creation_pt.isoformat() if p.date_creation_pt else None
        } for p in points],
        'pagination': {
            'page': page,
            'limit': limit,
            'total': total,
            'pages': (total + limit - 1) // limit
        }
    })

@api_bp.route('/points/<int:id>', methods=['GET'])
@cross_origin()
def api_get_point(id):
    """Détail d'un point de vente"""
    point = PointDeVente.query.get_or_404(id)
    return api_response(data={
        'id': point.id_pt,
        'nom': point.nom_pt,
        'adresse': point.adresse,
        'latitude': float(point.latitude) if point.latitude else None,
        'longitude': float(point.longitude) if point.longitude else None,
        'telephone': point.telephone,
        'photo': point.photo,
        'categorie': point.categorie.nom_cat if point.categorie else None,
        'couleur': point.categorie.couleur if point.categorie else None,
        'date_creation': point.date_creation_pt.isoformat() if point.date_creation_pt else None,
        'date_modif': point.date_modif.isoformat() if point.date_modif else None
    })

@api_bp.route('/points', methods=['POST'])
@jwt_required()
@cross_origin()
def api_create_point():
    """Créer un point de vente (authentifié)"""
    data = request.get_json()
    current_user_id = get_jwt_identity()
    user = Utilisateur.query.get(current_user_id)
    
    if not user or user.role not in ['admin', 'agent']:
        return api_response(message='Accès non autorisé', status='error', code=403)
    
    nom = data.get('nom')
    adresse = data.get('adresse')
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    telephone = data.get('telephone')
    id_cat = data.get('categorie_id')
    
    if not nom or not adresse:
        return api_response(message='Nom et adresse sont obligatoires', status='error', code=400)
    
    point = PointDeVente(
        nom_pt=nom,
        adresse=adresse,
        latitude=latitude,
        longitude=longitude,
        telephone=telephone,
        id_cat=id_cat,
        date_creation_pt=datetime.now()
    )
    
    db.session.add(point)
    db.session.commit()
    
    return api_response(data={'id': point.id_pt}, message='Point de vente créé', code=201)

@api_bp.route('/points/<int:id>', methods=['PUT'])
@jwt_required()
@cross_origin()
def api_update_point(id):
    """Modifier un point de vente (authentifié)"""
    point = PointDeVente.query.get_or_404(id)
    data = request.get_json()
    
    point.nom_pt = data.get('nom', point.nom_pt)
    point.adresse = data.get('adresse', point.adresse)
    point.latitude = data.get('latitude', point.latitude)
    point.longitude = data.get('longitude', point.longitude)
    point.telephone = data.get('telephone', point.telephone)
    point.id_cat = data.get('categorie_id', point.id_cat)
    point.date_modif = datetime.now()
    
    db.session.commit()
    return api_response(message='Point de vente modifié')

@api_bp.route('/points/<int:id>', methods=['DELETE'])
@jwt_required()
@cross_origin()
def api_delete_point(id):
    """Supprimer un point de vente (admin uniquement)"""
    current_user_id = get_jwt_identity()
    user = Utilisateur.query.get(current_user_id)
    
    if not user or user.role != 'admin':
        return api_response(message='Accès administrateur requis', status='error', code=403)
    
    point = PointDeVente.query.get_or_404(id)
    
    if Visite.query.filter_by(id_pt=id).count() > 0:
        return api_response(message='Impossible de supprimer un point avec des visites associées', status='error', code=400)
    
    db.session.delete(point)
    db.session.commit()
    return api_response(message='Point de vente supprimé')

# ==========================================================
# 4. VISITES
# ==========================================================

@api_bp.route('/visites', methods=['GET'])
@jwt_required()
@cross_origin()
def api_get_visites():
    """Liste des visites (authentifié)"""
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    statut = request.args.get('statut', '').strip()
    
    query = Visite.query
    
    if statut:
        query = query.filter_by(statut=statut)
    
    total = query.count()
    visites = query.order_by(desc(Visite.date_prevue)).offset((page - 1) * limit).limit(limit).all()
    
    return api_response(data={
        'visites': [{
            'id': v.id_visite,
            'date_prevue': v.date_prevue.isoformat(),
            'heure_prevue': v.heure_prevue.isoformat() if v.heure_prevue else None,
            'date_reelle': v.date_reelle.isoformat() if v.date_reelle else None,
            'heure_reelle': v.heure_reelle.isoformat() if v.heure_reelle else None,
            'statut': v.statut,
            'compte_rendu': v.compte_rendu,
            'point_vente': {
                'id': v.point.id_pt,
                'nom': v.point.nom_pt,
                'adresse': v.point.adresse
            } if v.point else None
        } for v in visites],
        'pagination': {
            'page': page,
            'limit': limit,
            'total': total,
            'pages': (total + limit - 1) // limit
        }
    })

@api_bp.route('/visites/<int:id>', methods=['GET'])
@jwt_required()
@cross_origin()
def api_get_visite(id):
    """Détail d'une visite"""
    visite = Visite.query.get_or_404(id)
    return api_response(data={
        'id': visite.id_visite,
        'date_prevue': visite.date_prevue.isoformat(),
        'heure_prevue': visite.heure_prevue.isoformat() if visite.heure_prevue else None,
        'date_reelle': visite.date_reelle.isoformat() if visite.date_reelle else None,
        'heure_reelle': visite.heure_reelle.isoformat() if visite.heure_reelle else None,
        'statut': visite.statut,
        'compte_rendu': visite.compte_rendu,
        'point_vente': {
            'id': visite.point.id_pt,
            'nom': visite.point.nom_pt,
            'adresse': visite.point.adresse
        } if visite.point else None,
        'agents': [{
            'id': a.id_user,
            'nom': a.nom_user,
            'email': a.mail
        } for a in visite.agents]
    })

@api_bp.route('/visites', methods=['POST'])
@jwt_required()
@cross_origin()
def api_create_visite():
    """Créer une visite (authentifié)"""
    data = request.get_json()
    
    date_prevue = data.get('date_prevue')
    heure_prevue = data.get('heure_prevue')
    id_pt = data.get('point_vente_id')
    statut = data.get('statut', 'planifiee')
    compte_rendu = data.get('compte_rendu')
    
    if not date_prevue or not heure_prevue or not id_pt:
        return api_response(message='Date, heure et point de vente sont obligatoires', status='error', code=400)
    
    visite = Visite(
        date_prevue=datetime.strptime(date_prevue, '%Y-%m-%d').date(),
        heure_prevue=datetime.strptime(heure_prevue, '%H:%M').time(),
        id_pt=int(id_pt),
        statut=statut,
        compte_rendu=compte_rendu,
        date_creation=datetime.now()
    )
    
    db.session.add(visite)
    db.session.commit()
    
    return api_response(data={'id': visite.id_visite}, message='Visite créée', code=201)

# ==========================================================
# 5. STATISTIQUES
# ==========================================================

@api_bp.route('/stats', methods=['GET'])
@jwt_required()
@cross_origin()
def api_get_stats():
    """Statistiques (authentifié)"""
    total_visites = Visite.query.count()
    total_realisees = Visite.query.filter_by(statut='realisee').count()
    total_attente = Visite.query.filter_by(statut='attente').count()
    total_retard = Visite.query.filter_by(statut='retard').count()
    total_encours = Visite.query.filter_by(statut='encours').count()
    
    points_par_categorie = []
    for cat in Categorie.query.all():
        points_par_categorie.append({
            'categorie': cat.nom_cat,
            'couleur': cat.couleur,
            'nombre': len(cat.points)
        })
    
    return api_response(data={
        'visites': {
            'total': total_visites,
            'realisees': total_realisees,
            'en_attente': total_attente,
            'en_retard': total_retard,
            'en_cours': total_encours
        },
        'points_par_categorie': points_par_categorie
    })