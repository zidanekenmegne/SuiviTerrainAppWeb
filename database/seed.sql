-- ==========================================================
-- SUIVITERRAIN - DONNEES DE TEST
-- Version 1.0
-- PostgreSQL
-- ==========================================================

-- ==========================================================
-- 1. CATEGORIES
-- ==========================================================
INSERT INTO categorie (nom_cat, couleur) VALUES
('Alimentation', '#28a745'),
('Services', '#007bff'),
('Vetement', '#ffc107'),
('Electronique', '#dc3545'),
('Automobile', '#6f42c1'),
('Immobilier', '#fd7e14'),
('Sante', '#20c997')
ON CONFLICT (nom_cat) DO NOTHING;

-- ==========================================================
-- 2. UTILISATEURS (mot de passe = "admin123" haché en bcrypt)
-- ==========================================================
INSERT INTO utilisateur (nom_user, mail, mdp, role, zone_intervention, date_creation_user) VALUES
('Zidane Fredy', 'zidane@suiviterrain.com', '$2b$12$K7p9Qy3X5eL6fG8hJkLmNoPqRsTuVwXyZ1234567890AbCdEfGhIjK', 'admin', 'Douala', NOW()),
('Sarah Niong', 'sarah@suiviterrain.com', '$2b$12$K7p9Qy3X5eL6fG8hJkLmNoPqRsTuVwXyZ1234567890AbCdEfGhIjK', 'agent', 'Yaounde', NOW()),
('Jean Dupont', 'jean@suiviterrain.com', '$2b$12$K7p9Qy3X5eL6fG8hJkLmNoPqRsTuVwXyZ1234567890AbCdEfGhIjK', 'agent', 'Douala', NOW()),
('Marie Claire', 'marie@suiviterrain.com', '$2b$12$K7p9Qy3X5eL6fG8hJkLmNoPqRsTuVwXyZ1234567890AbCdEfGhIjK', 'agent', 'Bafoussam', NOW()),
('Paul Ngassa', 'paul@suiviterrain.com', '$2b$12$K7p9Qy3X5eL6fG8hJkLmNoPqRsTuVwXyZ1234567890AbCdEfGhIjK', 'agent', 'Douala', NOW())
ON CONFLICT (mail) DO NOTHING;

-- ==========================================================
-- 3. POINTS DE VENTE
-- ==========================================================
INSERT INTO point_de_vente (nom_pt, adresse, latitude, longitude, telephone, photo, id_cat, date_creation_pt) VALUES
('Magasin A - Centre-ville', '123 Rue de Paris, Douala', 4.051056, 9.767869, '+237 612 34 56 78', 'magasin_a.jpg', 1, NOW()),
('Client B - Bonamoussadi', '45 Avenue de l''Independance, Douala', 4.058300, 9.738600, '+237 698 54 32 10', 'client_b.jpg', 2, NOW()),
('Magasin C - Akwa', '78 Rue Joss, Douala', 4.045600, 9.692300, '+237 677 88 99 00', 'magasin_c.jpg', 3, NOW()),
('Client D - Bepanda', '12 Avenue de la Gare, Douala', 4.062100, 9.713500, '+237 699 12 34 56', 'client_d.jpg', 1, NOW()),
('Magasin E - Total Logbaba', '234 Boulevard de l''Ocean, Douala', 4.040200, 9.727800, '+237 655 78 90 12', 'magasin_e.jpg', 4, NOW()),
('Client F - Makape', '67 Rue des Cocotiers, Douala', 4.075400, 9.750100, '+237 688 45 67 89', 'client_f.jpg', 2, NOW()),
('Magasin G - Bonapriso', '89 Avenue Charles de Gaulle, Douala', 4.068900, 9.771200, '+237 622 33 44 55', 'magasin_g.jpg', 1, NOW()),
('Client H - Makepe', '56 Rue des Palmiers, Douala', 4.083000, 9.729500, '+237 677 11 22 33', 'client_h.jpg', 2, NOW()),
('Magasin I - Kotto', '123 Boulevard de la Liberte, Douala', 4.052800, 9.688400, '+237 699 88 77 66', 'magasin_i.jpg', 4, NOW()),
('Client J - Mbangue', '45 Rue des Ecoles, Douala', 4.061700, 9.698900, '+237 655 44 33 22', 'client_j.jpg', 3, NOW())
ON CONFLICT (id_pt) DO NOTHING;

-- ==========================================================
-- 4. VISITES
-- ==========================================================
INSERT INTO visite (date_prevue, heure_prevue, date_reelle, heure_reelle, statut, compte_rendu, id_pt, date_creation) VALUES
('2026-08-12', '08:00:00', '2026-08-12', '08:30:00', 'realisee', 'Visite effectuee avec succes. Nouvelle commande de 50 unites.', 1, NOW()),
('2026-08-12', '10:30:00', NULL, NULL, 'attente', 'Client non disponible, a rappeler.', 2, NOW()),
('2026-08-12', '13:00:00', NULL, NULL, 'retard', 'Retard de 30 minutes.', 3, NOW()),
('2026-08-13', '09:00:00', '2026-08-13', '09:45:00', 'realisee', 'Collecte de paiement effectuee.', 4, NOW()),
('2026-08-13', '11:00:00', NULL, NULL, 'attente', 'En attente de validation client.', 5, NOW()),
('2026-08-14', '15:00:00', '2026-08-14', '15:30:00', 'realisee', 'Presentation produit bien recue.', 6, NOW()),
('2026-08-15', '09:30:00', NULL, NULL, 'encours', 'Visite en cours.', 7, NOW()),
('2026-08-15', '14:00:00', NULL, NULL, 'planifiee', 'Visite planifiee pour collecte de commandes.', 8, NOW()),
('2026-08-16', '10:00:00', NULL, NULL, 'planifiee', 'Visite de suivi.', 9, NOW()),
('2026-08-17', '11:30:00', NULL, NULL, 'planifiee', 'Collecte de paiement.', 10, NOW())
ON CONFLICT (id_visite) DO NOTHING;

-- ==========================================================
-- 5. REALISER (Association UTILISATEUR - VISITE)
-- ==========================================================
INSERT INTO realiser (id_user, id_visite) VALUES
(1, 1),  -- Zidane réalise visite 1
(2, 2),  -- Sarah réalise visite 2
(3, 3),  -- Jean réalise visite 3
(4, 4),  -- Marie réalise visite 4
(5, 5),  -- Paul réalise visite 5
(1, 6),  -- Zidane réalise visite 6
(2, 7),  -- Sarah réalise visite 7
(3, 8),  -- Jean réalise visite 8
(4, 9),  -- Marie réalise visite 9
(5, 10)  -- Paul réalise visite 10
ON CONFLICT (id_user, id_visite) DO NOTHING;

-- ==========================================================
-- 6. JOURNAL DE CONNEXION
-- ==========================================================
INSERT INTO journal_connexion (id_user, adresse_ip, horodatage) VALUES
(1, '192.168.1.10', NOW() - INTERVAL '1 day'),
(1, '192.168.1.10', NOW() - INTERVAL '2 hours'),
(2, '192.168.1.20', NOW() - INTERVAL '3 hours'),
(3, '192.168.1.30', NOW() - INTERVAL '4 hours'),
(4, '192.168.1.40', NOW() - INTERVAL '5 hours'),
(5, '192.168.1.50', NOW() - INTERVAL '6 hours'),
(1, '192.168.1.10', NOW())
ON CONFLICT (id_journal) DO NOTHING;