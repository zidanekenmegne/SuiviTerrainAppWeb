from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# Table d'association REALISER (many-to-many entre utilisateur et visite)
realiser = db.Table('realiser',
    db.Column('id_user', db.Integer, db.ForeignKey('utilisateur.id_user'), primary_key=True),
    db.Column('id_visite', db.Integer, db.ForeignKey('visite.id_visite'), primary_key=True)
)

class Utilisateur(db.Model):
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
    connexions = db.relationship('JournalConnexion', back_populates='utilisateur')
    
    def __repr__(self):
        return f'<Utilisateur {self.nom_user}>'

class Categorie(db.Model):
    __tablename__ = 'categorie'
    
    id_cat = db.Column(db.Integer, primary_key=True)
    nom_cat = db.Column(db.String(50), unique=True, nullable=False)
    couleur = db.Column(db.String(7), nullable=False)
    date_creation_cat = db.Column(db.DateTime, default=datetime.now)
    
    # Relations
    points = db.relationship('PointDeVente', back_populates='categorie')
    
    def __repr__(self):
        return f'<Categorie {self.nom_cat}>'

class PointDeVente(db.Model):
    __tablename__ = 'point_de_vente'
    
    id_pt = db.Column(db.Integer, primary_key=True)
    nom_pt = db.Column(db.String(100), nullable=False)
    adresse = db.Column(db.Text, nullable=False)
    latitude = db.Column(db.Numeric(10, 7), nullable=False)
    longitude = db.Column(db.Numeric(10, 7), nullable=False)
    telephone = db.Column(db.String(20))
    photo = db.Column(db.String(255))
    date_creation_pt = db.Column(db.DateTime, default=datetime.now)
    date_modif = db.Column(db.DateTime)
    
    # Clé étrangère
    id_cat = db.Column(db.Integer, db.ForeignKey('categorie.id_cat'), nullable=True)
    
    # Relations
    categorie = db.relationship('Categorie', back_populates='points')
    visites = db.relationship('Visite', back_populates='point')
    
    def __repr__(self):
        return f'<PointDeVente {self.nom_pt}>'

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
    
    # Clé étrangère
    id_pt = db.Column(db.Integer, db.ForeignKey('point_de_vente.id_pt'), nullable=True)
    
    # Relations
    point = db.relationship('PointDeVente', back_populates='visites')
    agents = db.relationship('Utilisateur', secondary=realiser, back_populates='visites')
    
    def __repr__(self):
        return f'<Visite {self.id_visite} - {self.date_prevue}>'

class JournalConnexion(db.Model):
    __tablename__ = 'journal_connexion'
    
    id_journal = db.Column(db.Integer, primary_key=True)
    horodatage = db.Column(db.DateTime, default=datetime.now)
    adresse_ip = db.Column(db.String(45))
    
    # Clé étrangère
    id_user = db.Column(db.Integer, db.ForeignKey('utilisateur.id_user'), nullable=False)
    
    # Relations
    utilisateur = db.relationship('Utilisateur', back_populates='connexions')
    
    def __repr__(self):
        return f'<JournalConnexion {self.id_journal} - {self.horodatage}>'