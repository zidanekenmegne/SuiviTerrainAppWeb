-- ==========================================================
-- SUIVITERRAIN - SCHEMA DE LA BASE DE DONNEES (MLD)
-- Version 1.2 - Sécurisée
-- PostgreSQL
-- ==========================================================

-- ==========================================================
-- CRÉATION DES TABLES (avec vérification d'existence)
-- ==========================================================

-- TABLE utilisateur
CREATE TABLE IF NOT EXISTS utilisateur (
    id_user SERIAL PRIMARY KEY,
    nom_user VARCHAR(100) NOT NULL,
    mail VARCHAR(150) UNIQUE NOT NULL,
    mdp VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'agent',
    zone_intervention VARCHAR(100),
    date_creation_user TIMESTAMP DEFAULT NOW(),
    derniere_connexion_user TIMESTAMP,
    CONSTRAINT chk_role CHECK (role IN ('admin', 'agent'))
);

-- TABLE categorie
CREATE TABLE IF NOT EXISTS categorie (
    id_cat SERIAL PRIMARY KEY,
    nom_cat VARCHAR(50) UNIQUE NOT NULL,
    couleur VARCHAR(7) NOT NULL,
    date_creation_cat TIMESTAMP DEFAULT NOW()
);

-- TABLE point_de_vente
CREATE TABLE IF NOT EXISTS point_de_vente (
    id_pt SERIAL PRIMARY KEY,
    nom_pt VARCHAR(100) NOT NULL,
    adresse TEXT NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    telephone VARCHAR(20),
    photo VARCHAR(255),
    date_creation_pt TIMESTAMP DEFAULT NOW(),
    date_modif TIMESTAMP,
    id_cat INTEGER,
    CONSTRAINT fk_point_categorie FOREIGN KEY (id_cat)
        REFERENCES categorie(id_cat) ON DELETE SET NULL
);

-- TABLE visite
CREATE TABLE IF NOT EXISTS visite (
    id_visite SERIAL PRIMARY KEY,
    date_prevue DATE NOT NULL,
    heure_prevue TIME NOT NULL,
    date_reelle DATE,
    heure_reelle TIME,
    compte_rendu TEXT,
    statut VARCHAR(20) NOT NULL DEFAULT 'planifiee',
    date_creation TIMESTAMP DEFAULT NOW(),
    date_modif TIMESTAMP,
    id_pt INTEGER,
    CONSTRAINT fk_visite_point FOREIGN KEY (id_pt)
        REFERENCES point_de_vente(id_pt) ON DELETE SET NULL,
    CONSTRAINT chk_statut CHECK (statut IN ('planifiee', 'encours', 'realisee', 'attente', 'retard', 'annulee'))
);

-- TABLE realiser (association UTILISATEUR - VISITE)
CREATE TABLE IF NOT EXISTS realiser (
    id_user INTEGER,
    id_visite INTEGER,
    PRIMARY KEY (id_user, id_visite),
    CONSTRAINT fk_realiser_utilisateur FOREIGN KEY (id_user)
        REFERENCES utilisateur(id_user) ON DELETE CASCADE,
    CONSTRAINT fk_realiser_visite FOREIGN KEY (id_visite)
        REFERENCES visite(id_visite) ON DELETE CASCADE
);

-- TABLE journal_connexion
CREATE TABLE IF NOT EXISTS journal_connexion (
    id_journal SERIAL PRIMARY KEY,
    horodatage TIMESTAMP DEFAULT NOW(),
    adresse_ip VARCHAR(45),
    id_user INTEGER NOT NULL,
    CONSTRAINT fk_journal_utilisateur FOREIGN KEY (id_user)
        REFERENCES utilisateur(id_user) ON DELETE CASCADE
);

-- ==========================================================
-- INDEX POUR LES PERFORMANCES
-- ==========================================================

CREATE INDEX IF NOT EXISTS idx_visite_date_prevue ON visite(date_prevue);
CREATE INDEX IF NOT EXISTS idx_visite_statut ON visite(statut);
CREATE INDEX IF NOT EXISTS idx_visite_point ON visite(id_pt);
CREATE INDEX IF NOT EXISTS idx_point_categorie ON point_de_vente(id_cat);
CREATE INDEX IF NOT EXISTS idx_journal_utilisateur ON journal_connexion(id_user);
CREATE INDEX IF NOT EXISTS idx_realiser_utilisateur ON realiser(id_user);
CREATE INDEX IF NOT EXISTS idx_realiser_visite ON realiser(id_visite);

-- ==========================================================
-- VÉRIFICATION DES TABLES CRÉÉES
-- ==========================================================

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;