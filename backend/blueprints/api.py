"""
API REST SuiviTerrain
Version : 1.0
Préfixe : /api/v1

Contient les routes de l'API pour :
    - Authentification (login, register, refresh, profil)
    - Catégories
    - Points de vente
    - Visites
    - Utilisateurs
    - Notifications
    - Upload de photos de profil
"""

import os
import re
import uuid
from datetime import datetime, timedelta

from flask import Blueprint, current_app, jsonify, request
from flask_cors import cross_origin
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from sqlalchemy import desc

from models import (
    Categorie,
    JournalConnexion,
    Notification,
    PointDeVente,
    Utilisateur,
    Visite,
    db,
    realiser,
)


api_bp = Blueprint('api', __name__, url_prefix='/api/v1')


# ==========================================================
# LIMITEUR DE REQUÊTES
# ==========================================================

limiter = Limiter(
    key_func=get_remote_address,
    enabled=True
)


# ==========================================================
# CONSTANTES DE VALIDATION
# ==========================================================

ROLES_VALIDES = {'admin', 'agent'}
STATUTS_VISITE_VALIDES = {
    'planifiee', 'encours', 'realisee', 'attente', 'retard', 'annulee'
}
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
TELEPHONE_REGEX = re.compile(r'^(\+237|0)?[67][0-9]{8}$')


# ==========================================================
# FONCTIONS UTILITAIRES
# ==========================================================

def api_response(data=None, message=None, status='success', code=200):
    """Retourne une réponse JSON uniforme."""
    response = {'status': status}
    if message:
        response['message'] = message
    if data is not None:
        response['data'] = data
    return jsonify(response), code


def get_current_user():
    """Récupère l'utilisateur connecté depuis le JWT. Retourne None si absent."""
    try:
        current_user_id = int(get_jwt_identity())
        return Utilisateur.query.get(current_user_id)
    except (ValueError, TypeError):
        return None


def validate_email(email):
    """Valide le format d'un email."""
    return bool(EMAIL_REGEX.match(email))


def validate_password(password):
    """
    Valide la robustesse d'un mot de passe.
    Retourne (bool, message_erreur).
    """
    if len(password) < 8:
        return False, 'Le mot de passe doit contenir au moins 8 caractères'
    if not any(c.isdigit() for c in password):
        return False, 'Le mot de passe doit contenir au moins un chiffre'
    if not any(c.isalpha() for c in password):
        return False, 'Le mot de passe doit contenir au moins une lettre'
    return True, ''


def validate_phone(telephone):
    """Valide un numéro de téléphone camerounais."""
    if not telephone:
        return True
    return bool(TELEPHONE_REGEX.match(telephone.replace(' ', '')))


# ==========================================================
# ROUTE DE TEST
# ==========================================================

@api_bp.route('/test', methods=['GET'])
@cross_origin()
def api_test():
    """Route de test publique."""
    return jsonify({
        'status': 'success',
        'message': 'API SuiviTerrain fonctionne',
        'data': {
            'version': '1.0'
        }
    })


# ==========================================================
# 1. AUTHENTIFICATION
# ==========================================================

@api_bp.route('/auth/login', methods=['POST'])
@limiter.limit("10 per minute", exempt_when=lambda: current_app.config.get('TESTING', False))
def api_login():
    """Authentifie un utilisateur et génère un token JWT."""
    try:
        data = request.get_json()
        email = (data.get('email') or '').strip()
        mdp = data.get('mdp') or ''

        if not email or not mdp:
            current_app.logger.warning(
                f"Tentative de login incomplète depuis {request.remote_addr}"
            )
            return api_response(
                message='Email et mot de passe requis',
                status='error',
                code=400
            )

        user = Utilisateur.query.filter_by(mail=email).first()

        if not user:
            current_app.logger.warning(
                f"Login échoué - email inconnu : {email}"
            )
            return api_response(
                message='Email ou mot de passe incorrect',
                status='error',
                code=401
            )

        from werkzeug.security import check_password_hash
        if not check_password_hash(user.mdp, mdp):
            current_app.logger.warning(
                f"Login échoué - mot de passe invalide pour : {email}"
            )
            return api_response(
                message='Email ou mot de passe incorrect',
                status='error',
                code=401
            )

        if not user.actif:
            current_app.logger.warning(f"Login refusé - compte désactivé : {email}")
            return api_response(
                message='Compte désactivé',
                status='error',
                code=403
            )

        journal = JournalConnexion(
            id_user=user.id_user,
            adresse_ip=request.remote_addr,
            horodatage=datetime.now()
        )
        db.session.add(journal)

        user.derniere_connexion_user = datetime.now()
        db.session.commit()

        current_app.logger.info(
            f"Login réussi : {user.mail} (ID {user.id_user})"
        )

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

    except Exception as exc:
        db.session.rollback()
        current_app.logger.error(f"Erreur login : {exc}")
        return api_response(
            message='Erreur lors de la connexion',
            status='error',
            code=500
        )


@api_bp.route('/auth/register', methods=['POST'])
@limiter.limit("5 per minute")
def api_register():
    """Inscrit un nouvel utilisateur."""
    try:
        data = request.get_json()

        nom = (data.get('nom') or '').strip()
        email = (data.get('email') or '').strip()
        password = data.get('password') or ''
        role = data.get('role', 'agent')

        if not nom or not email or not password:
            return api_response(
                message='Nom, email et mot de passe sont obligatoires',
                status='error',
                code=400
            )

        if not validate_email(email):
            return api_response(
                message='Format d\'email invalide',
                status='error',
                code=400
            )

        is_valid, pwd_message = validate_password(password)
        if not is_valid:
            return api_response(message=pwd_message, status='error', code=400)

        if role not in ROLES_VALIDES:
            return api_response(
                message='Rôle invalide',
                status='error',
                code=400
            )

        existing_user = Utilisateur.query.filter_by(mail=email).first()
        if existing_user:
            return api_response(
                message='Un compte avec cet email existe déjà',
                status='error',
                code=409
            )

        from werkzeug.security import generate_password_hash
        hashed_password = generate_password_hash(password)

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

        current_app.logger.info(f"Nouvel utilisateur inscrit : {email} (rôle : {role})")

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

    except Exception as exc:
        db.session.rollback()
        current_app.logger.error(f"Erreur inscription : {exc}")
        return api_response(
            message='Erreur lors de la création du compte',
            status='error',
            code=500
        )


@api_bp.route('/auth/refresh', methods=['POST'])
@jwt_required()
def api_refresh():
    """Rafraîchit le token JWT."""
    current_user_id = get_jwt_identity()
    new_token = create_access_token(
        identity=str(current_user_id),
        expires_delta=timedelta(days=7)
    )
    return api_response(data={'token': new_token}, message='Token rafraîchi')


# ==========================================================
# 2. CATÉGORIES
# ==========================================================

@api_bp.route('/categories', methods=['GET'])
@cross_origin()
def api_get_categories():
    """Liste des catégories (public)."""
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
    """Liste des points de vente (public)."""
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
    points = query.order_by(PointDeVente.nom_pt)\
        .offset((page - 1) * limit).limit(limit).all()

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
    """Détail d'un point de vente."""
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
@limiter.limit("30 per minute")
@cross_origin()
def api_create_point():
    """Crée un point de vente (authentifié)."""
    try:
        data = request.get_json()
        user = get_current_user()

        if not user or user.role not in ROLES_VALIDES:
            return api_response(message='Accès non autorisé', status='error', code=403)

        nom = (data.get('nom') or '').strip()
        adresse = (data.get('adresse') or '').strip()
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        telephone = (data.get('telephone') or '').strip() or None
        id_cat = data.get('categorie_id')

        if not nom or not adresse:
            return api_response(
                message='Nom et adresse sont obligatoires',
                status='error',
                code=400
            )

        if not validate_phone(telephone):
            return api_response(
                message='Format de téléphone invalide',
                status='error',
                code=400
            )

        if id_cat is not None:
            try:
                id_cat = int(id_cat)
            except (ValueError, TypeError):
                return api_response(
                    message='Identifiant de catégorie invalide',
                    status='error',
                    code=400
                )

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

        current_app.logger.info(
            f"Point de vente créé : ID {point.id_pt} par user {user.id_user}"
        )

        return api_response(
            data={'id': point.id_pt},
            message='Point de vente créé',
            code=201
        )

    except Exception as exc:
        db.session.rollback()
        current_app.logger.error(f"Erreur création point de vente : {exc}")
        return api_response(
            message='Erreur lors de la création du point de vente',
            status='error',
            code=500
        )


@api_bp.route('/points/<int:id>', methods=['PUT'])
@jwt_required()
@limiter.limit("30 per minute")
@cross_origin()
def api_update_point(id):
    """Modifie un point de vente (authentifié)."""
    try:
        point = PointDeVente.query.get_or_404(id)
        data = request.get_json()

        if 'nom' in data and data['nom']:
            point.nom_pt = data['nom'].strip()
        if 'adresse' in data and data['adresse']:
            point.adresse = data['adresse'].strip()
        if 'latitude' in data:
            point.latitude = data['latitude']
        if 'longitude' in data:
            point.longitude = data['longitude']
        if 'telephone' in data:
            telephone = (data['telephone'] or '').strip() or None
            if not validate_phone(telephone):
                return api_response(
                    message='Format de téléphone invalide',
                    status='error',
                    code=400
                )
            point.telephone = telephone
        if 'categorie_id' in data and data['categorie_id']:
            try:
                point.id_cat = int(data['categorie_id'])
            except (ValueError, TypeError):
                return api_response(
                    message='Identifiant de catégorie invalide',
                    status='error',
                    code=400
                )

        point.date_modif = datetime.now()
        db.session.commit()

        current_app.logger.info(f"Point de vente modifié : ID {point.id_pt}")

        return api_response(message='Point de vente modifié')

    except Exception as exc:
        db.session.rollback()
        current_app.logger.error(f"Erreur modification point de vente : {exc}")
        return api_response(
            message='Erreur lors de la modification',
            status='error',
            code=500
        )


@api_bp.route('/points/<int:id>', methods=['DELETE'])
@jwt_required()
@limiter.limit("10 per minute")
@cross_origin()
def api_delete_point(id):
    """Supprime un point de vente (admin uniquement)."""
    try:
        user = get_current_user()

        if not user or user.role != 'admin':
            return api_response(
                message='Accès administrateur requis',
                status='error',
                code=403
            )

        point = PointDeVente.query.get_or_404(id)

        if Visite.query.filter_by(id_pt=id).count() > 0:
            return api_response(
                message='Impossible de supprimer un point avec des visites associées',
                status='error',
                code=400
            )

        db.session.delete(point)
        db.session.commit()

        current_app.logger.info(
            f"Point de vente supprimé : ID {id} par user {user.id_user}"
        )

        return api_response(message='Point de vente supprimé')

    except Exception as exc:
        db.session.rollback()
        current_app.logger.error(f"Erreur suppression point de vente : {exc}")
        return api_response(
            message='Erreur lors de la suppression',
            status='error',
            code=500
        )


# ==========================================================
# 4. VISITES
# ==========================================================

@api_bp.route('/visites', methods=['GET'])
@jwt_required()
@cross_origin()
def api_get_visites():
    """
    Liste des visites.
    - Admin : voit toutes les visites.
    - Agent : ne voit que ses visites assignées.
    """
    try:
        user = get_current_user()
        if not user:
            return api_response(message='Utilisateur non trouvé', status='error', code=404)

        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        statut = request.args.get('statut', '').strip()
        date_filter = request.args.get('date', '').strip()
        date_from = request.args.get('date_from', '').strip()
        date_to = request.args.get('date_to', '').strip()

        query = Visite.query

        # Filtre par rôle : un agent ne voit que ses visites
        if user.role != 'admin':
            query = query.join(realiser).filter(realiser.c.id_user == user.id_user)

        if statut:
            if statut not in STATUTS_VISITE_VALIDES:
                return api_response(
                    message='Statut invalide',
                    status='error',
                    code=400
                )
            query = query.filter_by(statut=statut)

        if date_filter:
            try:
                date_obj = datetime.strptime(date_filter, '%Y-%m-%d').date()
                query = query.filter(Visite.date_prevue == date_obj)
            except ValueError:
                pass

        if date_from:
            try:
                date_obj = datetime.strptime(date_from, '%Y-%m-%d').date()
                query = query.filter(Visite.date_prevue >= date_obj)
            except ValueError:
                pass

        if date_to:
            try:
                date_obj = datetime.strptime(date_to, '%Y-%m-%d').date()
                query = query.filter(Visite.date_prevue <= date_obj)
            except ValueError:
                pass

        total = query.count()
        visites = query.order_by(desc(Visite.date_prevue))\
            .offset((page - 1) * limit).limit(limit).all()

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
                } if v.point else None,
                'agents': [{
                    'id': a.id_user,
                    'nom': a.nom_user,
                    'email': a.mail
                } for a in v.agents]
            } for v in visites],
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        })

    except Exception as exc:
        current_app.logger.error(f"Erreur liste visites : {exc}")
        return api_response(
            message='Erreur lors du chargement des visites',
            status='error',
            code=500
        )


@api_bp.route('/visites/<int:id>', methods=['GET'])
@jwt_required()
@cross_origin()
def api_get_visite(id):
    """
    Détail d'une visite.
    - Admin : accès à toutes les visites.
    - Agent : accès uniquement aux visites qui lui sont assignées.
    """
    try:
        user = get_current_user()
        if not user:
            return api_response(message='Utilisateur non trouvé', status='error', code=404)

        visite = Visite.query.get_or_404(id)

        # Contrôle du propriétaire pour les agents
        if user.role != 'admin':
            is_assigned = any(a.id_user == user.id_user for a in visite.agents)
            if not is_assigned:
                current_app.logger.warning(
                    f"Accès refusé : user {user.id_user} → visite {id}"
                )
                return api_response(
                    message='Accès non autorisé à cette visite',
                    status='error',
                    code=403
                )

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

    except Exception as exc:
        current_app.logger.error(f"Erreur détail visite : {exc}")
        return api_response(
            message='Erreur lors du chargement de la visite',
            status='error',
            code=500
        )


@api_bp.route('/visites', methods=['POST'])
@jwt_required()
@limiter.limit("30 per minute")
@cross_origin()
def api_create_visite():
    """Crée une visite (authentifié)."""
    try:
        data = request.get_json()
        user = get_current_user()
        if not user:
            return api_response(message='Utilisateur non trouvé', status='error', code=404)

        date_prevue = data.get('date_prevue')
        heure_prevue = data.get('heure_prevue')
        id_pt = data.get('point_vente_id')
        statut = data.get('statut', 'planifiee')
        compte_rendu = data.get('compte_rendu')
        agent_id = data.get('agent_id')

        if not date_prevue or not heure_prevue or not id_pt:
            return api_response(
                message='Date, heure et point de vente sont obligatoires',
                status='error',
                code=400
            )

        if statut not in STATUTS_VISITE_VALIDES:
            return api_response(
                message='Statut invalide',
                status='error',
                code=400
            )

        heure_str = heure_prevue
        if len(heure_str) == 5:
            heure_str += ':00'

        visite = Visite(
            date_prevue=datetime.strptime(date_prevue, '%Y-%m-%d').date(),
            heure_prevue=datetime.strptime(heure_str, '%H:%M:%S').time(),
            id_pt=int(id_pt),
            statut=statut,
            compte_rendu=compte_rendu,
            date_creation=datetime.now()
        )
        db.session.add(visite)
        db.session.flush()

        target_user_id = int(agent_id) if agent_id else user.id_user

        agent = Utilisateur.query.get(target_user_id)
        if not agent:
            db.session.rollback()
            return api_response(message='Agent introuvable', status='error', code=404)

        db.session.execute(
            realiser.insert().values(
                id_user=target_user_id,
                id_visite=visite.id_visite
            )
        )

        if target_user_id != user.id_user:
            creer_notification(
                user_id=target_user_id,
                titre="Nouvelle visite assignée",
                message=f"Une visite vous a été assignée pour le {date_prevue} à {heure_prevue}",
                type='visite',
                lien=f'/visites/{visite.id_visite}'
            )

        db.session.commit()

        current_app.logger.info(
            f"Visite créée : ID {visite.id_visite}, point {id_pt}, agent {target_user_id}"
        )

        return api_response(
            data={'id': visite.id_visite},
            message='Visite créée avec succès',
            code=201
        )

    except Exception as exc:
        db.session.rollback()
        current_app.logger.error(f"Erreur création visite : {exc}")
        return api_response(
            message='Erreur lors de la création de la visite',
            status='error',
            code=500
        )


@api_bp.route('/visites/<int:id>', methods=['PUT'])
@jwt_required()
@limiter.limit("30 per minute")
@cross_origin()
def api_update_visite(id):
    """Modifie une visite (authentifié)."""
    try:
        user = get_current_user()
        if not user:
            return api_response(message='Utilisateur non trouvé', status='error', code=404)

        visite = Visite.query.get_or_404(id)

        # Contrôle du propriétaire
        if user.role != 'admin':
            is_assigned = any(a.id_user == user.id_user for a in visite.agents)
            if not is_assigned:
                return api_response(
                    message='Accès non autorisé à cette visite',
                    status='error',
                    code=403
                )

        data = request.get_json()

        if 'date_prevue' in data and data['date_prevue']:
            visite.date_prevue = datetime.strptime(data['date_prevue'], '%Y-%m-%d').date()

        if 'heure_prevue' in data and data['heure_prevue']:
            heure_str = data['heure_prevue']
            if len(heure_str) == 5:
                heure_str += ':00'
            visite.heure_prevue = datetime.strptime(heure_str, '%H:%M:%S').time()

        if 'statut' in data:
            if data['statut'] not in STATUTS_VISITE_VALIDES:
                return api_response(
                    message='Statut invalide',
                    status='error',
                    code=400
                )
            visite.statut = data['statut']

        if 'compte_rendu' in data:
            visite.compte_rendu = data['compte_rendu']

        if 'point_vente_id' in data and data['point_vente_id']:
            visite.id_pt = int(data['point_vente_id'])

        if 'date_reelle' in data and data['date_reelle']:
            visite.date_reelle = datetime.strptime(data['date_reelle'], '%Y-%m-%d').date()

        if 'heure_reelle' in data and data['heure_reelle']:
            heure_str = data['heure_reelle']
            if len(heure_str) == 5:
                heure_str += ':00'
            visite.heure_reelle = datetime.strptime(heure_str, '%H:%M:%S').time()

        visite.date_modif = datetime.now()
        db.session.commit()

        if 'statut' in data:
            for agent in visite.agents:
                creer_notification(
                    user_id=agent.id_user,
                    titre="Statut de visite mis à jour",
                    message=f"La visite du {visite.date_prevue} est maintenant : {visite.statut}",
                    type='visite',
                    lien=f'/visites/{visite.id_visite}'
                )
            db.session.commit()

        current_app.logger.info(f"Visite modifiée : ID {visite.id_visite}")

        return api_response(message='Visite modifiée avec succès')

    except Exception as exc:
        db.session.rollback()
        current_app.logger.error(f"Erreur modification visite : {exc}")
        return api_response(
            message='Erreur lors de la modification de la visite',
            status='error',
            code=500
        )


@api_bp.route('/visites/<int:id>', methods=['DELETE'])
@jwt_required()
@limiter.limit("10 per minute")
@cross_origin()
def api_delete_visite(id):
    """Supprime une visite (admin ou agent assigné)."""
    try:
        user = get_current_user()
        if not user:
            return api_response(message='Utilisateur non trouvé', status='error', code=404)

        visite = Visite.query.get_or_404(id)

        is_admin = user.role == 'admin'
        is_assigned = any(a.id_user == user.id_user for a in visite.agents)

        if not (is_admin or is_assigned):
            return api_response(
                message='Vous n\'avez pas la permission de supprimer cette visite',
                status='error',
                code=403
            )

        db.session.delete(visite)
        db.session.commit()

        current_app.logger.info(f"Visite supprimée : ID {id} par user {user.id_user}")

        return api_response(message='Visite supprimée avec succès')

    except Exception as exc:
        db.session.rollback()
        current_app.logger.error(f"Erreur suppression visite : {exc}")
        return api_response(
            message='Erreur lors de la suppression de la visite',
            status='error',
            code=500
        )


# ==========================================================
# 5. STATISTIQUES
# ==========================================================

@api_bp.route('/stats', methods=['GET'])
@jwt_required()
@cross_origin()
def api_get_stats():
    """Statistiques globales (authentifié)."""
    total_visites = Visite.query.count()
    total_realisees = Visite.query.filter_by(statut='realisee').count()
    total_attente = Visite.query.filter_by(statut='attente').count()
    total_retard = Visite.query.filter_by(statut='retard').count()
    total_encours = Visite.query.filter_by(statut='encours').count()

    points_par_categorie = [{
        'categorie': cat.nom_cat,
        'couleur': cat.couleur,
        'nombre': len(cat.points)
    } for cat in Categorie.query.all()]

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
    """Visites du jour pour l'agent connecté."""
    try:
        current_user_id = int(get_jwt_identity())
        today = datetime.now().date()

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

    except Exception as exc:
        current_app.logger.error(f"Erreur visites du jour : {exc}")
        return api_response(
            message='Erreur lors du chargement des visites du jour',
            status='error',
            code=500
        )


@api_bp.route('/points/filter', methods=['GET'])
@cross_origin()
def api_filter_points():
    """Points de vente avec filtrage avancé."""
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
        query = query.join(Visite).join(Utilisateur)\
            .filter(Utilisateur.zone_intervention.ilike(f'%{zone}%'))

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
# 6. UTILISATEURS
# ==========================================================

@api_bp.route('/utilisateurs', methods=['GET'])
@jwt_required()
@cross_origin()
def api_get_utilisateurs():
    """Liste des utilisateurs (admin uniquement)."""
    try:
        user = get_current_user()
        if not user or user.role != 'admin':
            return api_response(
                message='Accès administrateur requis',
                status='error',
                code=403
            )

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

    except Exception as exc:
        current_app.logger.error(f"Erreur liste utilisateurs : {exc}")
        return api_response(
            message='Erreur lors du chargement des utilisateurs',
            status='error',
            code=500
        )


@api_bp.route('/utilisateurs/<int:id>', methods=['GET'])
@jwt_required()
@cross_origin()
def api_get_utilisateur(id):
    """Détail d'un utilisateur (admin uniquement)."""
    try:
        user = get_current_user()
        if not user or user.role != 'admin':
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

    except Exception as exc:
        current_app.logger.error(f"Erreur détail utilisateur : {exc}")
        return api_response(
            message='Erreur lors du chargement de l\'utilisateur',
            status='error',
            code=500
        )


@api_bp.route('/utilisateurs', methods=['POST'])
@jwt_required()
@limiter.limit("10 per minute")
@cross_origin()
def api_create_utilisateur():
    """Crée un utilisateur (admin uniquement)."""
    try:
        user = get_current_user()
        if not user or user.role != 'admin':
            return api_response(
                message='Accès administrateur requis',
                status='error',
                code=403
            )

        data = request.get_json()

        nom = (data.get('nom') or '').strip()
        email = (data.get('email') or '').strip()
        password = data.get('password') or ''
        role = data.get('role', 'agent')
        zone = (data.get('zone_intervention') or '').strip()

        if not nom or not email or not password:
            return api_response(
                message='Nom, email et mot de passe sont obligatoires',
                status='error',
                code=400
            )

        if not validate_email(email):
            return api_response(
                message='Format d\'email invalide',
                status='error',
                code=400
            )

        is_valid, pwd_message = validate_password(password)
        if not is_valid:
            return api_response(message=pwd_message, status='error', code=400)

        if role not in ROLES_VALIDES:
            return api_response(
                message='Rôle invalide',
                status='error',
                code=400
            )

        existing = Utilisateur.query.filter_by(mail=email).first()
        if existing:
            return api_response(
                message='Un compte avec cet email existe déjà',
                status='error',
                code=409
            )

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

        current_app.logger.info(f"Utilisateur créé : {email} (rôle : {role})")

        return api_response(
            data={'id': new_user.id_user},
            message='Utilisateur créé avec succès',
            code=201
        )

    except Exception as exc:
        db.session.rollback()
        current_app.logger.error(f"Erreur création utilisateur : {exc}")
        return api_response(
            message='Erreur lors de la création de l\'utilisateur',
            status='error',
            code=500
        )


@api_bp.route('/utilisateurs/<int:id>', methods=['PUT'])
@jwt_required()
@limiter.limit("10 per minute")
@cross_origin()
def api_update_utilisateur(id):
    """Modifie un utilisateur (admin uniquement)."""
    try:
        user = get_current_user()
        if not user or user.role != 'admin':
            return api_response(
                message='Accès administrateur requis',
                status='error',
                code=403
            )

        utilisateur = Utilisateur.query.get_or_404(id)
        data = request.get_json()

        if 'nom' in data and data['nom']:
            utilisateur.nom_user = data['nom'].strip()

        if 'email' in data and data['email']:
            new_email = data['email'].strip()
            if not validate_email(new_email):
                return api_response(
                    message='Format d\'email invalide',
                    status='error',
                    code=400
                )
            existing = Utilisateur.query.filter(
                Utilisateur.mail == new_email,
                Utilisateur.id_user != id
            ).first()
            if existing:
                return api_response(
                    message='Cet email est déjà utilisé',
                    status='error',
                    code=409
                )
            utilisateur.mail = new_email

        if 'role' in data:
            if data['role'] not in ROLES_VALIDES:
                return api_response(
                    message='Rôle invalide',
                    status='error',
                    code=400
                )
            utilisateur.role = data['role']

        if 'zone_intervention' in data:
            zone = data['zone_intervention']
            utilisateur.zone_intervention = zone.strip() if zone else None

        if 'actif' in data:
            utilisateur.actif = bool(data['actif'])

        db.session.commit()

        current_app.logger.info(f"Utilisateur modifié : ID {id}")

        return api_response(message='Utilisateur modifié avec succès')

    except Exception as exc:
        db.session.rollback()
        current_app.logger.error(f"Erreur modification utilisateur : {exc}")
        return api_response(
            message='Erreur lors de la modification de l\'utilisateur',
            status='error',
            code=500
        )


@api_bp.route('/utilisateurs/<int:id>', methods=['DELETE'])
@jwt_required()
@limiter.limit("5 per minute")
@cross_origin()
def api_delete_utilisateur(id):
    """Supprime un utilisateur (admin uniquement)."""
    try:
        user = get_current_user()
        if not user or user.role != 'admin':
            return api_response(
                message='Accès administrateur requis',
                status='error',
                code=403
            )

        if id == user.id_user:
            return api_response(
                message='Vous ne pouvez pas supprimer votre propre compte',
                status='error',
                code=400
            )

        utilisateur = Utilisateur.query.get_or_404(id)

        if utilisateur.visites:
            return api_response(
                message='Impossible de supprimer un utilisateur avec des visites associées',
                status='error',
                code=400
            )

        db.session.delete(utilisateur)
        db.session.commit()

        current_app.logger.info(f"Utilisateur supprimé : ID {id} par user {user.id_user}")

        return api_response(message='Utilisateur supprimé avec succès')

    except Exception as exc:
        db.session.rollback()
        current_app.logger.error(f"Erreur suppression utilisateur : {exc}")
        return api_response(
            message='Erreur lors de la suppression de l\'utilisateur',
            status='error',
            code=500
        )


@api_bp.route('/utilisateurs/agents', methods=['GET'])
@jwt_required()
@cross_origin()
def api_get_agents():
    """Liste des agents actifs (authentifié)."""
    try:
        agents = Utilisateur.query.filter_by(role='agent', actif=True)\
            .order_by(Utilisateur.nom_user).all()

        return api_response(data=[{
            'id': a.id_user,
            'nom': a.nom_user,
            'email': a.mail,
            'zone_intervention': a.zone_intervention
        } for a in agents])

    except Exception as exc:
        current_app.logger.error(f"Erreur liste agents : {exc}")
        return api_response(
            message='Erreur lors du chargement des agents',
            status='error',
            code=500
        )


# ==========================================================
# 7. PROFIL UTILISATEUR
# ==========================================================

@api_bp.route('/auth/me', methods=['GET'])
@jwt_required()
@cross_origin()
def api_get_me():
    """Récupère les informations de l'utilisateur connecté."""
    try:
        user = get_current_user()
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

    except Exception as exc:
        current_app.logger.error(f"Erreur get_me : {exc}")
        return api_response(
            message='Erreur lors du chargement du profil',
            status='error',
            code=500
        )


@api_bp.route('/auth/me', methods=['PUT'])
@jwt_required()
@limiter.limit("20 per minute")
@cross_origin()
def api_update_me():
    """Modifie le profil de l'utilisateur connecté."""
    try:
        user = get_current_user()
        if not user:
            return api_response(message='Utilisateur non trouvé', status='error', code=404)

        data = request.get_json()

        if 'nom' in data and data['nom'].strip():
            user.nom_user = data['nom'].strip()

        if 'email' in data and data['email'].strip():
            new_email = data['email'].strip()
            if not validate_email(new_email):
                return api_response(
                    message='Format d\'email invalide',
                    status='error',
                    code=400
                )
            existing = Utilisateur.query.filter(
                Utilisateur.mail == new_email,
                Utilisateur.id_user != user.id_user
            ).first()
            if existing:
                return api_response(
                    message='Cet email est déjà utilisé',
                    status='error',
                    code=409
                )
            user.mail = new_email

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

    except Exception as exc:
        db.session.rollback()
        current_app.logger.error(f"Erreur update_me : {exc}")
        return api_response(
            message='Erreur lors de la mise à jour du profil',
            status='error',
            code=500
        )


@api_bp.route('/auth/password', methods=['PUT'])
@jwt_required()
@limiter.limit("5 per minute")
@cross_origin()
def api_change_password():
    """Change le mot de passe de l'utilisateur connecté."""
    try:
        user = get_current_user()
        if not user:
            return api_response(message='Utilisateur non trouvé', status='error', code=404)

        data = request.get_json()
        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')

        if not current_password or not new_password:
            return api_response(
                message='Tous les champs sont obligatoires',
                status='error',
                code=400
            )

        is_valid, pwd_message = validate_password(new_password)
        if not is_valid:
            return api_response(message=pwd_message, status='error', code=400)

        from werkzeug.security import check_password_hash, generate_password_hash

        if not check_password_hash(user.mdp, current_password):
            return api_response(
                message='Mot de passe actuel incorrect',
                status='error',
                code=400
            )

        user.mdp = generate_password_hash(new_password)
        db.session.commit()

        current_app.logger.info(f"Mot de passe modifié pour user {user.id_user}")

        return api_response(message='Mot de passe modifié avec succès')

    except Exception as exc:
        db.session.rollback()
        current_app.logger.error(f"Erreur change_password : {exc}")
        return api_response(
            message='Erreur lors du changement de mot de passe',
            status='error',
            code=500
        )


@api_bp.route('/stats/user', methods=['GET'])
@jwt_required()
@cross_origin()
def api_get_user_stats():
    """Statistiques de l'utilisateur connecté."""
    try:
        user = get_current_user()
        if not user:
            return api_response(message='Utilisateur non trouvé', status='error', code=404)

        visites_realisees = Visite.query.join(
            realiser, Visite.id_visite == realiser.c.id_visite
        ).filter(
            realiser.c.id_user == user.id_user,
            Visite.statut == 'realisee'
        ).count()

        visites_attente = Visite.query.join(
            realiser, Visite.id_visite == realiser.c.id_visite
        ).filter(
            realiser.c.id_user == user.id_user,
            Visite.statut == 'attente'
        ).count()

        points_total = PointDeVente.query.count()

        return api_response(data={
            'visites_realisees': visites_realisees,
            'visites_attente': visites_attente,
            'points_vente': points_total
        })

    except Exception as exc:
        current_app.logger.error(f"Erreur user_stats : {exc}")
        return api_response(
            message='Erreur lors du chargement des statistiques',
            status='error',
            code=500
        )


# ==========================================================
# 8. UPLOAD PHOTO DE PROFIL
# ==========================================================

ALLOWED_AVATAR_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_AVATAR_SIZE = 5 * 1024 * 1024  # 5 Mo


def allowed_avatar_file(filename):
    """Vérifie l'extension du fichier téléversé."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_AVATAR_EXTENSIONS


@api_bp.route('/auth/photo', methods=['POST'])
@jwt_required()
@limiter.limit("10 per minute")
@cross_origin()
def api_upload_photo():
    """Téléverse la photo de profil de l'utilisateur connecté."""
    try:
        user = get_current_user()
        if not user:
            return api_response(message='Utilisateur non trouvé', status='error', code=404)

        if 'photo' not in request.files:
            return api_response(message='Aucun fichier envoyé', status='error', code=400)

        file = request.files['photo']

        if file.filename == '':
            return api_response(message='Nom de fichier vide', status='error', code=400)

        if not allowed_avatar_file(file.filename):
            return api_response(
                message='Format non autorisé. Utilisez PNG, JPG, JPEG, GIF ou WEBP',
                status='error',
                code=400
            )

        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)

        if file_size > MAX_AVATAR_SIZE:
            return api_response(
                message='L\'image ne doit pas dépasser 5 Mo',
                status='error',
                code=400
            )

        # Vérification du type MIME réel
        try:
            from PIL import Image
            img = Image.open(file.stream)
            img.verify()
            file.stream.seek(0)
        except Exception:
            return api_response(
                message='Fichier image invalide ou corrompu',
                status='error',
                code=400
            )

        upload_folder = os.path.join(
            current_app.config['UPLOAD_FOLDER'],
            'avatars'
        )
        os.makedirs(upload_folder, exist_ok=True)

        ext = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"user_{user.id_user}_{uuid.uuid4().hex[:8]}.{ext}"
        filepath = os.path.join(upload_folder, unique_filename)

        if user.photo:
            old_path = os.path.join(
                current_app.config['UPLOAD_FOLDER'],
                'avatars',
                os.path.basename(user.photo)
            )
            if os.path.exists(old_path):
                try:
                    os.remove(old_path)
                except OSError:
                    pass

        file.save(filepath)

        user.photo = f"/static/uploads/avatars/{unique_filename}"
        db.session.commit()

        current_app.logger.info(f"Photo de profil mise à jour pour user {user.id_user}")

        return api_response(
            data={'photo': user.photo},
            message='Photo mise à jour avec succès'
        )

    except Exception as exc:
        db.session.rollback()
        current_app.logger.error(f"Erreur upload photo : {exc}")
        return api_response(
            message='Erreur lors du téléversement de la photo',
            status='error',
            code=500
        )


@api_bp.route('/auth/photo', methods=['DELETE'])
@jwt_required()
@limiter.limit("10 per minute")
@cross_origin()
def api_delete_photo():
    """Supprime la photo de profil de l'utilisateur connecté."""
    try:
        user = get_current_user()
        if not user:
            return api_response(message='Utilisateur non trouvé', status='error', code=404)

        if user.photo:
            filepath = os.path.join(
                current_app.config['UPLOAD_FOLDER'],
                'avatars',
                os.path.basename(user.photo)
            )
            if os.path.exists(filepath):
                try:
                    os.remove(filepath)
                except OSError:
                    pass

            user.photo = None
            db.session.commit()

        return api_response(message='Photo supprimée avec succès')

    except Exception as exc:
        db.session.rollback()
        current_app.logger.error(f"Erreur suppression photo : {exc}")
        return api_response(
            message='Erreur lors de la suppression de la photo',
            status='error',
            code=500
        )


# ==========================================================
# 9. NOTIFICATIONS
# ==========================================================

@api_bp.route('/notifications', methods=['GET'])
@jwt_required()
@cross_origin()
def api_get_notifications():
    """Liste des notifications de l'utilisateur connecté."""
    try:
        user = get_current_user()
        if not user:
            return api_response(message='Utilisateur non trouvé', status='error', code=404)

        only_unread = request.args.get('unread', 'false').lower() == 'true'

        query = Notification.query.filter_by(id_user=user.id_user)

        if only_unread:
            query = query.filter_by(lu=False)

        notifications = query.order_by(desc(Notification.date_creation)).limit(100).all()

        return api_response(data={
            'notifications': [{
                'id': n.id_notification,
                'type': n.type,
                'titre': n.titre,
                'message': n.message,
                'lien': n.lien,
                'lu': n.lu,
                'date_creation': n.date_creation.isoformat() if n.date_creation else None
            } for n in notifications],
            'total': Notification.query.filter_by(id_user=user.id_user).count(),
            'non_lues': Notification.query.filter_by(id_user=user.id_user, lu=False).count()
        })

    except Exception as exc:
        current_app.logger.error(f"Erreur liste notifications : {exc}")
        return api_response(
            message='Erreur lors du chargement des notifications',
            status='error',
            code=500
        )


@api_bp.route('/notifications/<int:id>/lu', methods=['PUT'])
@jwt_required()
@limiter.limit("60 per minute")
@cross_origin()
def api_mark_notification_read(id):
    """Marque une notification comme lue."""
    try:
        user = get_current_user()
        if not user:
            return api_response(message='Utilisateur non trouvé', status='error', code=404)

        notif = Notification.query.filter_by(
            id_notification=id,
            id_user=user.id_user
        ).first_or_404()

        notif.lu = True
        db.session.commit()

        return api_response(message='Notification marquée comme lue')

    except Exception as exc:
        db.session.rollback()
        current_app.logger.error(f"Erreur marquage notification : {exc}")
        return api_response(
            message='Erreur lors du marquage de la notification',
            status='error',
            code=500
        )


@api_bp.route('/notifications/tout-lu', methods=['PUT'])
@jwt_required()
@limiter.limit("20 per minute")
@cross_origin()
def api_mark_all_notifications_read():
    """Marque toutes les notifications de l'utilisateur comme lues."""
    try:
        user = get_current_user()
        if not user:
            return api_response(message='Utilisateur non trouvé', status='error', code=404)

        Notification.query.filter_by(id_user=user.id_user, lu=False)\
            .update({'lu': True})
        db.session.commit()

        return api_response(message='Toutes les notifications sont lues')

    except Exception as exc:
        db.session.rollback()
        current_app.logger.error(f"Erreur marquage notifications : {exc}")
        return api_response(
            message='Erreur lors du marquage des notifications',
            status='error',
            code=500
        )


@api_bp.route('/notifications/<int:id>', methods=['DELETE'])
@jwt_required()
@limiter.limit("30 per minute")
@cross_origin()
def api_delete_notification(id):
    """Supprime une notification."""
    try:
        user = get_current_user()
        if not user:
            return api_response(message='Utilisateur non trouvé', status='error', code=404)

        notif = Notification.query.filter_by(
            id_notification=id,
            id_user=user.id_user
        ).first_or_404()

        db.session.delete(notif)
        db.session.commit()

        return api_response(message='Notification supprimée')

    except Exception as exc:
        db.session.rollback()
        current_app.logger.error(f"Erreur suppression notification : {exc}")
        return api_response(
            message='Erreur lors de la suppression de la notification',
            status='error',
            code=500
        )


# ==========================================================
# HELPER : Créer une notification
# ==========================================================

def creer_notification(user_id, titre, message, type='info', lien=None):
    """
    Crée une notification pour un utilisateur.
    Ne commit pas : l'appelant est responsable du commit.
    """
    try:
        notif = Notification(
            id_user=user_id,
            titre=titre,
            message=message,
            type=type,
            lien=lien,
            lu=False,
            date_creation=datetime.now()
        )
        db.session.add(notif)
        return notif
    except Exception as exc:
        current_app.logger.error(f"Erreur création notification : {exc}")
        return None