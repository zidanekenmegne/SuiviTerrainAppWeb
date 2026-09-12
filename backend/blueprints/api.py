from flask import Blueprint, request, jsonify, url_for
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_cors import cross_origin
from flask_limiter import Limiter
from flask_login import current_user
from flask_limiter.util import get_remote_address
from models import db, Utilisateur, Categorie, PointDeVente, Visite, realiser
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

@api_bp.route('/auth/register', methods=['POST'])
@limiter.limit("5 per minute")
def api_register():
    """Inscription d'un nouvel utilisateur"""
    try:
        data = request.get_json()
        
        # 1. Validation des champs obligatoires
        nom = data.get('nom')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'agent')
        
        if not nom or not email or not password:
            return api_response(
                message='Nom, email et mot de passe sont obligatoires', 
                status='error', 
                code=400
            )
        
        # 2. Vérifier si l'email existe déjà
        existing_user = Utilisateur.query.filter_by(mail=email).first()
        if existing_user:
            return api_response(
                message='Un compte avec cet email existe déjà', 
                status='error', 
                code=409
            )
        
        # 3. Hasher le mot de passe
        from werkzeug.security import generate_password_hash
        hashed_password = generate_password_hash(password)
        
        # 4. Créer l'utilisateur
        new_user = Utilisateur(
            nom_user=nom,
            mail=email,
            mdp=hashed_password,
            role=role,
            actif=True,
            date_creation_user=datetime.now()
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # 5. Réponse de succès
        return api_response(
            data={
                'user': {
                    'id': new_user.id_user,
                    'nom': new_user.nom_user,
                    'email': new_user.mail,
                    'role': new_user.role
                }
            },
            message='Compte créé avec succès',
            code=201
        )
        
    except Exception as e:
        db.session.rollback()
        print(f"Erreur inscription: {str(e)}")  # Pour voir l'erreur dans la console Flask
        return api_response(
            message=f'Erreur lors de la création du compte: {str(e)}', 
            status='error', 
            code=500
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
    
@api_bp.route('/visites/jour', methods=['GET'])
@jwt_required()
@cross_origin()
def api_get_visites_jour():
    """Visites du jour pour l'agent connecté (JWT)"""
    try:
        # Récupérer l'ID depuis le JWT
        current_user_id = int(get_jwt_identity())
        today = datetime.now().date()
        
        # Requête avec jointure sur la table 'realiser'
        visites = Visite.query\
            .join(realiser, Visite.id_visite == realiser.c.id_visite)\
            .filter(
                Visite.date_prevue == today,
                realiser.c.id_user == current_user_id
            )\
            .order_by(Visite.heure_prevue)\
            .all()
        
        return api_response(data=[{
            'id': v.id_visite,
            'date_prevue': v.date_prevue.isoformat(),
            'heure_prevue': v.heure_prevue.isoformat() if v.heure_prevue else None,
            'statut': v.statut,
            'compte_rendu': v.compte_rendu,
            'point_vente': {
                'id': v.point.id_pt,
                'nom': v.point.nom_pt,
                'adresse': v.point.adresse,
                'latitude': float(v.point.latitude) if v.point.latitude else None,
                'longitude': float(v.point.longitude) if v.point.longitude else None,
                'categorie': v.point.categorie.nom_cat if v.point.categorie else None,
                'couleur': v.point.categorie.couleur if v.point.categorie else None
            } if v.point else None
        } for v in visites])
        
    except Exception as e:
        print(f"Erreur visites/jour: {str(e)}")
        return api_response(
            message=f'Erreur lors du chargement des visites: {str(e)}', 
            status='error', 
            code=500
        )
    
@api_bp.route('/points/filter', methods=['GET'])
@cross_origin()
def api_filter_points():
    """Points de vente avec filtrage avancé"""
    search = request.args.get('search', '').strip()
    categorie = request.args.get('categorie', '').strip()
    zone = request.args.get('zone', '').strip()
    
    query = PointDeVente.query
    
    if search:
        query = query.filter(
            (PointDeVente.nom_pt.ilike(f'%{search}%')) |
            (PointDeVente.adresse.ilike(f'%{search}%'))
        )
    
    if categorie:
        query = query.join(Categorie).filter(Categorie.nom_cat.ilike(f'%{categorie}%'))
    
    if zone:
        # Points de vente dans la zone d'intervention de l'agent
        # On peut chercher les utilisateurs de cette zone et leurs visites
        query = query.join(Visite).join(Utilisateur).filter(Utilisateur.zone_intervention.ilike(f'%{zone}%'))
    
    points = query.order_by(PointDeVente.nom_pt).limit(200).all()
    
    return api_response(data=[{
        'id': p.id_pt,
        'nom': p.nom_pt,
        'adresse': p.adresse,
        'latitude': float(p.latitude) if p.latitude else None,
        'longitude': float(p.longitude) if p.longitude else None,
        'telephone': p.telephone,
        'photo': p.photo,
        'categorie': p.categorie.nom_cat if p.categorie else None,
        'couleur': p.categorie.couleur if p.categorie else None,
        'categorie_id': p.id_cat
    } for p in points])

# ==========================================================
# 6. UTILISATEURS (admin uniquement)
# ==========================================================

@api_bp.route('/utilisateurs', methods=['GET'])
@jwt_required()
@cross_origin()
def api_get_utilisateurs():
    """Liste des utilisateurs (admin uniquement)"""
    try:
        current_user_id = int(get_jwt_identity())
        current_user = Utilisateur.query.get(current_user_id)
        
        if not current_user or current_user.role != 'admin':
            return api_response(
                message='Accès administrateur requis', 
                status='error', 
                code=403
            )
        
        # Récupérer tous les utilisateurs
        utilisateurs = Utilisateur.query.order_by(Utilisateur.nom_user).all()
        
        return api_response(data=[{
            'id': u.id_user,
            'nom': u.nom_user,
            'email': u.mail,
            'role': u.role,
            'zone_intervention': u.zone_intervention,
            'actif': u.actif,
            'date_creation': u.date_creation_user.isoformat() if u.date_creation_user else None,
            'derniere_connexion': u.derniere_connexion_user.isoformat() if u.derniere_connexion_user else None
        } for u in utilisateurs])
        
    except Exception as e:
        print(f"Erreur utilisateurs: {str(e)}")
        return api_response(message=f'Erreur: {str(e)}', status='error', code=500)


@api_bp.route('/utilisateurs/<int:id>', methods=['GET'])
@jwt_required()
@cross_origin()
def api_get_utilisateur(id):
    """Détail d'un utilisateur (admin uniquement)"""
    try:
        current_user_id = int(get_jwt_identity())
        current_user = Utilisateur.query.get(current_user_id)
        
        if not current_user or current_user.role != 'admin':
            return api_response(
                message='Accès administrateur requis', 
                status='error', 
                code=403
            )
        
        utilisateur = Utilisateur.query.get_or_404(id)
        
        return api_response(data={
            'id': utilisateur.id_user,
            'nom': utilisateur.nom_user,
            'email': utilisateur.mail,
            'role': utilisateur.role,
            'zone_intervention': utilisateur.zone_intervention,
            'actif': utilisateur.actif,
            'date_creation': utilisateur.date_creation_user.isoformat() if utilisateur.date_creation_user else None,
            'derniere_connexion': utilisateur.derniere_connexion_user.isoformat() if utilisateur.derniere_connexion_user else None
        })
        
    except Exception as e:
        print(f"Erreur utilisateur: {str(e)}")
        return api_response(message=f'Erreur: {str(e)}', status='error', code=500)


@api_bp.route('/utilisateurs', methods=['POST'])
@jwt_required()
@cross_origin()
def api_create_utilisateur():
    """Créer un utilisateur (admin uniquement)"""
    try:
        current_user_id = int(get_jwt_identity())
        current_user = Utilisateur.query.get(current_user_id)
        
        if not current_user or current_user.role != 'admin':
            return api_response(
                message='Accès administrateur requis', 
                status='error', 
                code=403
            )
        
        data = request.get_json()
        
        nom = data.get('nom', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        role = data.get('role', 'agent')
        zone = data.get('zone_intervention', '').strip()
        
        # Validation
        if not nom or not email or not password:
            return api_response(
                message='Nom, email et mot de passe sont obligatoires', 
                status='error', 
                code=400
            )
        
        if len(password) < 6:
            return api_response(
                message='Le mot de passe doit contenir au moins 6 caractères', 
                status='error', 
                code=400
            )
        
        # Vérifier si l'email existe déjà
        existing = Utilisateur.query.filter_by(mail=email).first()
        if existing:
            return api_response(
                message='Un compte avec cet email existe déjà', 
                status='error', 
                code=409
            )
        
        # Créer l'utilisateur
        from werkzeug.security import generate_password_hash
        hashed_password = generate_password_hash(password)
        
        new_user = Utilisateur(
            nom_user=nom,
            mail=email,
            mdp=hashed_password,
            role=role,
            zone_intervention=zone if zone else None,
            actif=True,
            date_creation_user=datetime.now()
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return api_response(
            data={'id': new_user.id_user},
            message='Utilisateur créé avec succès',
            code=201
        )
        
    except Exception as e:
        db.session.rollback()
        print(f"Erreur création utilisateur: {str(e)}")
        return api_response(message=f'Erreur: {str(e)}', status='error', code=500)


@api_bp.route('/utilisateurs/<int:id>', methods=['PUT'])
@jwt_required()
@cross_origin()
def api_update_utilisateur(id):
    """Modifier un utilisateur (admin uniquement)"""
    try:
        current_user_id = int(get_jwt_identity())
        current_user = Utilisateur.query.get(current_user_id)
        
        if not current_user or current_user.role != 'admin':
            return api_response(
                message='Accès administrateur requis', 
                status='error', 
                code=403
            )
        
        utilisateur = Utilisateur.query.get_or_404(id)
        data = request.get_json()
        
        # Mise à jour des champs
        if 'nom' in data:
            utilisateur.nom_user = data['nom'].strip()
        if 'email' in data:
            # Vérifier l'unicité de l'email
            existing = Utilisateur.query.filter(
                Utilisateur.mail == data['email'],
                Utilisateur.id_user != id
            ).first()
            if existing:
                return api_response(
                    message='Cet email est déjà utilisé', 
                    status='error', 
                    code=409
                )
            utilisateur.mail = data['email'].strip()
        if 'role' in data:
            utilisateur.role = data['role']
        if 'zone_intervention' in data:
            utilisateur.zone_intervention = data['zone_intervention'].strip() or None
        if 'actif' in data:
            utilisateur.actif = bool(data['actif'])
        
        db.session.commit()
        
        return api_response(message='Utilisateur modifié avec succès')
        
    except Exception as e:
        db.session.rollback()
        print(f"Erreur modification utilisateur: {str(e)}")
        return api_response(message=f'Erreur: {str(e)}', status='error', code=500)


@api_bp.route('/utilisateurs/<int:id>', methods=['DELETE'])
@jwt_required()
@cross_origin()
def api_delete_utilisateur(id):
    """Supprimer un utilisateur (admin uniquement)"""
    try:
        current_user_id = int(get_jwt_identity())
        current_user = Utilisateur.query.get(current_user_id)
        
        if not current_user or current_user.role != 'admin':
            return api_response(
                message='Accès administrateur requis', 
                status='error', 
                code=403
            )
        
        # Empêcher l'auto-suppression
        if id == current_user_id:
            return api_response(
                message='Vous ne pouvez pas supprimer votre propre compte', 
                status='error', 
                code=400
            )
        
        utilisateur = Utilisateur.query.get_or_404(id)
        
        # Vérifier s'il y a des visites associées
        if utilisateur.visites:
            return api_response(
                message='Impossible de supprimer un utilisateur avec des visites associées', 
                status='error', 
                code=400
            )
        
        db.session.delete(utilisateur)
        db.session.commit()
        
        return api_response(message='Utilisateur supprimé avec succès')
        
    except Exception as e:
        db.session.rollback()
        print(f"Erreur suppression utilisateur: {str(e)}")
        return api_response(message=f'Erreur: {str(e)}', status='error', code=500)

# ==========================================================
# 7. PROFIL UTILISATEUR (utilisateur connecté)
# ==========================================================

@api_bp.route('/auth/me', methods=['GET'])
@jwt_required()
@cross_origin()
def api_get_me():
    """Récupérer les infos de l'utilisateur connecté"""
    try:
        current_user_id = int(get_jwt_identity())
        user = Utilisateur.query.get(current_user_id)
        
        if not user:
            return api_response(message='Utilisateur non trouvé', status='error', code=404)
        
        return api_response(data={
            'id': user.id_user,
            'nom': user.nom_user,
            'email': user.mail,
            'role': user.role,
            'zone_intervention': user.zone_intervention,
            'photo': user.photo,
            'actif': user.actif,
            'date_creation': user.date_creation_user.isoformat() if user.date_creation_user else None,
            'derniere_connexion': user.derniere_connexion_user.isoformat() if user.derniere_connexion_user else None
        })
    except Exception as e:
        print(f"Erreur get_me: {str(e)}")
        return api_response(message=f'Erreur: {str(e)}', status='error', code=500)


@api_bp.route('/auth/me', methods=['PUT'])
@jwt_required()
@cross_origin()
def api_update_me():
    """Modifier son propre profil"""
    try:
        current_user_id = int(get_jwt_identity())
        user = Utilisateur.query.get(current_user_id)
        
        if not user:
            return api_response(message='Utilisateur non trouvé', status='error', code=404)
        
        data = request.get_json()
        
        # Mise à jour des champs autorisés
        if 'nom' in data and data['nom'].strip():
            user.nom_user = data['nom'].strip()
        
        if 'email' in data and data['email'].strip():
            # Vérifier l'unicité de l'email
            existing = Utilisateur.query.filter(
                Utilisateur.mail == data['email'],
                Utilisateur.id_user != current_user_id
            ).first()
            if existing:
                return api_response(message='Cet email est déjà utilisé', status='error', code=409)
            user.mail = data['email'].strip()
        
        if 'zone_intervention' in data:
            zone = data['zone_intervention']
            user.zone_intervention = zone.strip() if zone else None
        
        db.session.commit()
        
        return api_response(
            data={
                'id': user.id_user,
                'nom': user.nom_user,
                'email': user.mail,
                'role': user.role,
                'zone_intervention': user.zone_intervention,
                'photo': user.photo,
                'actif': user.actif
            },
            message='Profil mis à jour avec succès'
        )
    except Exception as e:
        db.session.rollback()
        print(f"Erreur update_me: {str(e)}")
        return api_response(message=f'Erreur: {str(e)}', status='error', code=500)


@api_bp.route('/auth/password', methods=['PUT'])
@jwt_required()
@cross_origin()
def api_change_password():
    """Changer son mot de passe"""
    try:
        current_user_id = int(get_jwt_identity())
        user = Utilisateur.query.get(current_user_id)
        
        if not user:
            return api_response(message='Utilisateur non trouvé', status='error', code=404)
        
        data = request.get_json()
        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')
        
        if not current_password or not new_password:
            return api_response(message='Tous les champs sont obligatoires', status='error', code=400)
        
        if len(new_password) < 6:
            return api_response(message='Le mot de passe doit contenir au moins 6 caractères', status='error', code=400)
        
        from werkzeug.security import check_password_hash, generate_password_hash
        
        if not check_password_hash(user.mdp, current_password):
            return api_response(message='Mot de passe actuel incorrect', status='error', code=400)
        
        user.mdp = generate_password_hash(new_password)
        db.session.commit()
        
        return api_response(message='Mot de passe modifié avec succès')
    except Exception as e:
        db.session.rollback()
        print(f"Erreur change_password: {str(e)}")
        return api_response(message=f'Erreur: {str(e)}', status='error', code=500)


@api_bp.route('/stats/user', methods=['GET'])
@jwt_required()
@cross_origin()
def api_get_user_stats():
    """Statistiques de l'utilisateur connecté"""
    try:
        current_user_id = int(get_jwt_identity())
        
        # Visites réalisées pour cet utilisateur
        visites_realisees = Visite.query.join(
            realiser, Visite.id_visite == realiser.c.id_visite
        ).filter(
            realiser.c.id_user == current_user_id,
            Visite.statut == 'realisee'
        ).count()
        
        # Visites en attente pour cet utilisateur
        visites_attente = Visite.query.join(
            realiser, Visite.id_visite == realiser.c.id_visite
        ).filter(
            realiser.c.id_user == current_user_id,
            Visite.statut == 'attente'
        ).count()
        
        # Nombre total de points de vente
        points_total = PointDeVente.query.count()
        
        return api_response(data={
            'visites_realisees': visites_realisees,
            'visites_attente': visites_attente,
            'points_vente': points_total
        })
    except Exception as e:
        print(f"Erreur user_stats: {str(e)}")
        return api_response(message=f'Erreur: {str(e)}', status='error', code=500)

# ==========================================================
# 8. UPLOAD PHOTO DE PROFIL
# ==========================================================

import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

ALLOWED_AVATAR_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_AVATAR_SIZE = 5 * 1024 * 1024  # 5 Mo


def allowed_avatar_file(filename):
    """Vérifie l'extension du fichier"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_AVATAR_EXTENSIONS


@api_bp.route('/auth/photo', methods=['POST'])
@jwt_required()
@cross_origin()
def api_upload_photo():
    """Upload de la photo de profil"""
    try:
        current_user_id = int(get_jwt_identity())
        user = Utilisateur.query.get(current_user_id)
        
        if not user:
            return api_response(message='Utilisateur non trouvé', status='error', code=404)
        
        # Vérifier qu'un fichier est envoyé
        if 'photo' not in request.files:
            return api_response(message='Aucun fichier envoyé', status='error', code=400)
        
        file = request.files['photo']
        
        if file.filename == '':
            return api_response(message='Nom de fichier vide', status='error', code=400)
        
        # Vérifier le type de fichier
        if not allowed_avatar_file(file.filename):
            return api_response(
                message='Format non autorisé. Utilisez PNG, JPG, JPEG, GIF ou WEBP',
                status='error',
                code=400
            )
        
        # Vérifier la taille (via le contenu)
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_AVATAR_SIZE:
            return api_response(
                message='L\'image ne doit pas dépasser 5 Mo',
                status='error',
                code=400
            )
        
        # Créer le dossier uploads/avatars s'il n'existe pas
        upload_folder = os.path.join(
            current_app.config['UPLOAD_FOLDER'],
            'avatars'
        )
        os.makedirs(upload_folder, exist_ok=True)
        
        # Générer un nom unique
        ext = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"user_{current_user_id}_{uuid.uuid4().hex[:8]}.{ext}"
        filepath = os.path.join(upload_folder, unique_filename)
        
        # Supprimer l'ancienne photo si elle existe
        if user.photo:
            old_path = os.path.join(
                current_app.config['UPLOAD_FOLDER'],
                'avatars',
                os.path.basename(user.photo)
            )
            if os.path.exists(old_path):
                try:
                    os.remove(old_path)
                except:
                    pass
        
        # Sauvegarder le nouveau fichier
        file.save(filepath)
        
        # Mettre à jour l'utilisateur
        user.photo = f"/static/uploads/avatars/{unique_filename}"
        db.session.commit()
        
        return api_response(
            data={'photo': user.photo},
            message='Photo mise à jour avec succès'
        )
        
    except Exception as e:
        db.session.rollback()
        print(f"Erreur upload photo: {str(e)}")
        return api_response(message=f'Erreur: {str(e)}', status='error', code=500)


@api_bp.route('/auth/photo', methods=['DELETE'])
@jwt_required()
@cross_origin()
def api_delete_photo():
    """Supprimer la photo de profil"""
    try:
        current_user_id = int(get_jwt_identity())
        user = Utilisateur.query.get(current_user_id)
        
        if not user:
            return api_response(message='Utilisateur non trouvé', status='error', code=404)
        
        if user.photo:
            # Supprimer le fichier physique
            filepath = os.path.join(
                current_app.config['UPLOAD_FOLDER'],
                'avatars',
                os.path.basename(user.photo)
            )
            if os.path.exists(filepath):
                try:
                    os.remove(filepath)
                except:
                    pass
            
            user.photo = None
            db.session.commit()
        
        return api_response(message='Photo supprimée avec succès')
        
    except Exception as e:
        db.session.rollback()
        return api_response(message=f'Erreur: {str(e)}', status='error', code=500)