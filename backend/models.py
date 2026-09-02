from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# ==========================================================
# TABLE D'ASSOCIATION REALISER (UTILISATEUR - VISITE)
# ==========================================================
realiser = db.Table('realiser',
    db.Column('id_user', db.Integer, db.ForeignKey('utilisateur.id_user'), primary_key=True),
    db.Column('id_visite', db.Integer, db.ForeignKey('visite.id_visite'), primary_key=True)
)

# ==========================================================
# MODÈLE UTILISATEUR
# ==========================================================
class Utilisateur(db.Model, UserMixin):
    __tablename__ = 'utilisateur'
    
    id_user = db.Column(db.Integer, primary_key=True)
    nom_user = db.Column(db.String(100), nullable=False)
    mail = db.Column(db.String(150), unique=True, nullable=False)
    mdp = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='agent')
    zone_intervention = db.Column(db.String(100))
    actif = db.Column(db.Boolean, default=True)
    date_creation_user = db.Column(db.DateTime, default=datetime.now)
    derniere_connexion_user = db.Column(db.DateTime)
    
    # Relations
    visites = db.relationship('Visite', secondary=realiser, back_populates='agents')
    connexions = db.relationship('JournalConnexion', back_populates='utilisateur', cascade='all, delete-orphan')
    
    # Méthodes Flask-Login
    def get_id(self):
        return str(self.id_user)
    
    @property
    def is_active(self):
        return self.actif if self.actif is not None else True
    
    @property
    def is_authenticated(self):
        return True
    
    @property
    def is_anonymous(self):
        return False
    
    def __repr__(self):
        return f'<Utilisateur {self.nom_user}>'

# ==========================================================
# MODÈLE CATEGORIE
# ==========================================================
class Categorie(db.Model):
    __tablename__ = 'categorie'
    
    id_cat = db.Column(db.Integer, primary_key=True)
    nom_cat = db.Column(db.String(50), unique=True, nullable=False)
    couleur = db.Column(db.String(7), nullable=False)
    date_creation_cat = db.Column(db.DateTime, default=datetime.now)
    
    points = db.relationship('PointDeVente', back_populates='categorie', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Categorie {self.nom_cat}>'

# ==========================================================
# MODÈLE POINT DE VENTE
# ==========================================================
class PointDeVente(db.Model):
    __tablename__ = 'point_de_vente'
    
    id_pt = db.Column(db.Integer, primary_key=True)
    nom_pt = db.Column(db.String(100), nullable=False)
    adresse = db.Column(db.Text, nullable=False)
    latitude = db.Column(db.Numeric(10, 7), nullable=True)
    longitude = db.Column(db.Numeric(10, 7), nullable=True)
    telephone = db.Column(db.String(20))
    photo = db.Column(db.String(255))
    date_creation_pt = db.Column(db.DateTime, default=datetime.now)
    date_modif = db.Column(db.DateTime)
    
    id_cat = db.Column(db.Integer, db.ForeignKey('categorie.id_cat'), nullable=True)
    
    categorie = db.relationship('Categorie', back_populates='points')
    visites = db.relationship('Visite', back_populates='point', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<PointDeVente {self.nom_pt}>'

# ==========================================================
# MODÈLE VISITE
# ==========================================================
class Visite(db.Model):
    __tablename__ = 'visite'
    
    id_visite = db.Column(db.Integer, primary_key=True)
    date_prevue = db.Column(db.Date, nullable=False)
    heure_prevue = db.Column(db.Time, nullable=False)
    date_reelle = db.Column(db.Date)
    heure_reelle = db.Column(db.Time)
    compte_rendu = db.Column(db.Text)
    statut = db.Column(db.String(20), nullable=False, default='planifiee')
    date_creation = db.Column(db.DateTime, default=datetime.now)
    date_modif = db.Column(db.DateTime)
    
    id_pt = db.Column(db.Integer, db.ForeignKey('point_de_vente.id_pt'), nullable=True)
    
    point = db.relationship('PointDeVente', back_populates='visites')
    agents = db.relationship('Utilisateur', secondary=realiser, back_populates='visites')
    
    def __repr__(self):
        return f'<Visite {self.id_visite} - {self.date_prevue}>'

# ==========================================================
# MODÈLE JOURNAL DE CONNEXION
# ==========================================================
class JournalConnexion(db.Model):
    __tablename__ = 'journal_connexion'
    
    id_journal = db.Column(db.Integer, primary_key=True)
    horodatage = db.Column(db.DateTime, default=datetime.now)
    adresse_ip = db.Column(db.String(45))
    
    id_user = db.Column(db.Integer, db.ForeignKey('utilisateur.id_user'), nullable=False)
    
    utilisateur = db.relationship('Utilisateur', back_populates='connexions')
    
    def __repr__(self):
        return f'<JournalConnexion {self.id_journal} - {self.horodatage}>'