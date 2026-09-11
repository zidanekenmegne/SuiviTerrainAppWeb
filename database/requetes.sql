-- ==========================================================
-- SUIVITERRAIN - REQUETES SQL
-- Version 1.0
-- PostgreSQL
-- ==========================================================

-- ==========================================================
-- 1. REQUETES DE BASE
-- ==========================================================

-- 1.1. Lister tous les utilisateurs
SELECT * FROM utilisateur;

-- 1.2. Lister toutes les catégories
SELECT * FROM categorie;

-- 1.3. Lister tous les points de vente
SELECT * FROM point_de_vente;

-- 1.4. Lister toutes les visites
SELECT * FROM visite;

-- ==========================================================
-- 2. FILTRES
-- ==========================================================

-- 2.1. Points de vente d'une catégorie spécifique
SELECT pv.nom_pt, pv.adresse, c.nom_cat AS categorie
FROM point_de_vente pv
JOIN categorie c ON pv.id_cat = c.id_cat
WHERE c.nom_cat = 'Alimentation';

-- 2.2. Visites d'un agent spécifique (via la table REALISER)
SELECT v.date_prevue, v.statut, pv.nom_pt AS point_vente
FROM visite v
JOIN realiser r ON v.id_visite = r.id_visite
JOIN utilisateur u ON r.id_user = u.id_user
JOIN point_de_vente pv ON v.id_pt = pv.id_pt
WHERE u.nom_user = 'Zidane Fredy';

-- 2.3. Visites d'une période donnée
SELECT * FROM visite
WHERE date_prevue BETWEEN '2026-08-12' AND '2026-08-15';

-- 2.4. Visites avec un statut spécifique
SELECT * FROM visite WHERE statut = 'realisee';

-- ==========================================================
-- 3. JOINTURES
-- ==========================================================

-- 3.1. Toutes les visites avec les infos de l'agent et du point de vente
SELECT 
    v.id_visite,
    v.date_prevue,
    v.statut,
    u.nom_user AS agent,
    pv.nom_pt AS point_vente,
    pv.adresse
FROM visite v
LEFT JOIN realiser r ON v.id_visite = r.id_visite
LEFT JOIN utilisateur u ON r.id_user = u.id_user
LEFT JOIN point_de_vente pv ON v.id_pt = pv.id_pt
ORDER BY v.date_prevue DESC;

-- 3.2. Points de vente avec leur catégorie
SELECT 
    pv.id_pt,
    pv.nom_pt,
    c.nom_cat AS categorie,
    c.couleur
FROM point_de_vente pv
INNER JOIN categorie c ON pv.id_cat = c.id_cat
ORDER BY c.nom_cat;

-- 3.3. Statistiques par agent
SELECT 
    u.nom_user AS agent,
    COUNT(r.id_visite) AS total_visites,
    SUM(CASE WHEN v.statut = 'realisee' THEN 1 ELSE 0 END) AS realisees,
    SUM(CASE WHEN v.statut = 'attente' THEN 1 ELSE 0 END) AS en_attente,
    SUM(CASE WHEN v.statut = 'retard' THEN 1 ELSE 0 END) AS en_retard,
    ROUND(SUM(CASE WHEN v.statut = 'realisee' THEN 1 ELSE 0 END)::DECIMAL / COUNT(r.id_visite) * 100, 1) AS taux_reussite
FROM utilisateur u
LEFT JOIN realiser r ON u.id_user = r.id_user
LEFT JOIN visite v ON r.id_visite = v.id_visite
WHERE u.role = 'agent'
GROUP BY u.id_user, u.nom_user
HAVING COUNT(r.id_visite) > 0
ORDER BY taux_reussite DESC;

-- ==========================================================
-- 4. STATISTIQUES ET GROUPES
-- ==========================================================

-- 4.1. Nombre de visites par statut
SELECT 
    statut,
    COUNT(*) AS nombre,
    ROUND(COUNT(*)::DECIMAL / (SELECT COUNT(*) FROM visite) * 100, 1) AS pourcentage
FROM visite
GROUP BY statut
ORDER BY nombre DESC;

-- 4.2. Nombre de points de vente par catégorie
SELECT 
    c.nom_cat AS categorie,
    COUNT(pv.id_pt) AS nombre_points
FROM categorie c
LEFT JOIN point_de_vente pv ON c.id_cat = pv.id_cat
GROUP BY c.id_cat, c.nom_cat
ORDER BY nombre_points DESC;

-- 4.3. Top 5 des points de vente les plus visités
SELECT 
    pv.nom_pt,
    COUNT(v.id_visite) AS nombre_visites
FROM point_de_vente pv
LEFT JOIN visite v ON pv.id_pt = v.id_pt
GROUP BY pv.id_pt, pv.nom_pt
ORDER BY nombre_visites DESC
LIMIT 5;

-- 4.4. Évolution des visites par mois
SELECT 
    TO_CHAR(date_prevue, 'YYYY-MM') AS mois,
    COUNT(*) AS nombre_visites
FROM visite
GROUP BY mois
ORDER BY mois;

-- ==========================================================
-- 5. SOUS-REQUETES
-- ==========================================================

-- 5.1. Agents ayant réalisé plus de 3 visites
SELECT u.nom_user, COUNT(r.id_visite) AS total_visites
FROM utilisateur u
JOIN realiser r ON u.id_user = r.id_user
GROUP BY u.id_user, u.nom_user
HAVING COUNT(r.id_visite) > 3;

-- 5.2. Points de vente avec le plus grand nombre de visites
SELECT 
    pv.nom_pt,
    (SELECT COUNT(*) FROM visite v WHERE v.id_pt = pv.id_pt) AS nb_visites
FROM point_de_vente pv
ORDER BY nb_visites DESC
LIMIT 5;

-- 5.3. Agents qui n'ont jamais réalisé de visite
SELECT u.nom_user, u.mail
FROM utilisateur u
WHERE u.role = 'agent'
AND NOT EXISTS (
    SELECT 1 FROM realiser r WHERE r.id_user = u.id_user
);

-- ==========================================================
-- 6. MISE A JOUR
-- ==========================================================
-- 6.1. Mettre à jour le statut des visites en retard
UPDATE visite
SET statut = 'retard'
WHERE date_prevue < CURRENT_DATE
AND statut NOT IN ('realisee', 'annulee');

-- 6.2. Désactiver un utilisateur (en ajoutant la colonne actif)
-- Étape 1 : Ajouter la colonne si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'utilisateur' AND column_name = 'actif'
    ) THEN
        ALTER TABLE utilisateur ADD COLUMN actif BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Étape 2 : Désactiver l'utilisateur
UPDATE utilisateur
SET actif = FALSE
WHERE id_user = 3;

-- 6.3. (Optionnel) Réactiver un utilisateur
-- UPDATE utilisateur
-- SET actif = TRUE
-- WHERE id_user = 3;

-- ==========================================================
-- 7. SUPPRESSION
-- ==========================================================

-- 7.1. Supprimer une visite (avec CASCADE, les enregistrements dans REALISER sont supprimés)
DELETE FROM visite WHERE id_visite = 10;

-- 7.2. Supprimer un point de vente
DELETE FROM point_de_vente WHERE id_pt = 10;