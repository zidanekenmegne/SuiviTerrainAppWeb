# Nous allons construire une apllication web SuiviTerrain  permettant à une entreprise de recenser ses points de vente ou ses clients sur une carte, de planifier les visites de ses agents commerciaux et de suivre les comptes rendus de ces visites
# ** Construction du repertoire---
SuiviTerrain/
├── backend/               # Côté serveur (Python/Flask)
│   ├── app.py            # Point d'entrée principal (Initialiser Flask, Importer vos différentes partie
                                                        (models, routes))
Lancer le serveur.
│   ├── models/           # Définition des tables (agents, points_vente, visites)
│   ├── routes/           # Les URL de votre API (ex: /api/visites)
│   └── config.py         # Configuration (base de données, clés secrètes)
│
├── frontend/             # Côté navigateur (React)
│   ├── src/
│   │   ├── components/   # Boutons, formulaires, cartes
│   │   ├── pages/        # Écrans (Dashboard, Planification)
│   │   └── App.js        # Composant racine
│   └── public/
│
└── docker-compose.yml    # (Optionnel) Pour lancer PostgreSQL, Flask et React ensemble
# **Environnement virtuel: c'est une boîte isolée pour vos dépendances, pour ne pas polluer votre Python global 
python -m venv venv
source venv/Scripts/activate

# ** Activation de Flask
pip install flask

# ** Initialiser flask dans backend

# ** Rôles des technologies 
1. PYTHON 3: Langage de programmation interprété, orienté objet, connu pour sa syntaxe claire et lisible.
Rôle dans SuiviTerrain : C'est le langage principal du backend. Toute la logique métier (créer un point de vente, planifier une visite, authentifier un agent) sera écrite en Python.
2. FLASK (avec extensions)
Signification : Micro-framework web pour Python. Il transforme notre code Python en serveur HTTP.
Rôle dans SuiviTerrain :
-Recevoir les requêtes du navigateur (ex: "affiche la liste des points de vente")
-Interagir avec PostgreSQL.
-Renvoyer des pages HTML (via Jinja2) ou des données JSON (via l'API REST).
 # ** Rôles des extensions flask 
   ** Flask-SQLAlchemy: Interface entre Flask et PostgreSQL (ORM)
   ** Flask-Migrate: Gère les évolutions du schéma de base
   ** Flask-Login: Gère les sessions utilisateur
   ** Flask-WTF: Gère les formulaires et leur validation
3. POSTGRESQL (avec pgAdmin et psql)
Signification : Système de gestion de base de données relationnelle (SGBDR) open-source, très puissant.
Rôle dans SuiviTerrain : 
-Stockage durable de toutes vos données : utilisateurs, points de vente, visites, catégories, journaux de connexion.
4. GIT & GITHUB
Signification :
Git : Système de contrôle de version distribué. Il sauvegarde l'historique de chaque modification de votre code.
GitHub : Plateforme en ligne pour héberger vos dépôts Git, collaborer, et faire des revues de code.
Rôle dans SuiviTerrain :
-Suivi de l'évolution du projet semaine après semaine.
-Possibilité de revenir en arrière en cas d'erreur.
-Preuve du travail effectué (historique des commits).
5. BOOTSTRAP 5
Signification : Framework CSS/JavaScript open-source qui fournit des composants d'interface prêts à l'emploi (boutons, barres de navigation, grilles, modales, etc.).
Rôle dans SuiviTerrain :
-Rendre l'interface professionnelle et responsive (adaptée à tous les écrans) sans écrire de CSS complexe.
6. JINJA2
Signification : Moteur de templates pour Python. Il permet d'injecter des données Python dans des pages HTML dynamiques.
Rôle dans SuiviTerrain (semaines 1 à 6) :
-Générer les pages HTML côté serveur avant que React ne prenne le relais
       <head>
            <title>{% block title %}SuiviTerrain{% endblock %}</title>
            <!-- Bootstrap CSS ici -->
        </head>
7. JAVASCRIPT (DOM, fetch, async/await)
Signification : Langage de programmation exécuté dans le navigateur. Permet de rendre la page interactive.
Rôle dans SuiviTerrain :
-Avant React : Manipuler le DOM, filtrer la liste des points sans recharger la page.
-Avec React : C'est la base de tout le frontend
8. REACT (avec Vite et React Router)
Signification : Bibliothèque JavaScript pour construire des interfaces utilisateur dynamiques. Elle fonctionne avec des composants réutilisables.
Rôle dans SuiviTerrain (semaine 7) : 
-Remplacer Jinja2 pour une expérience plus fluide. React consommera l'API REST Flask.
9. API CARTMOGRAPHIQUE (Google Maps ou Leaflet/OpenStreetMap)
Signification : Services qui fournissent des cartes interactives, des adresses (géocodage) et des itinéraires.
Rôle dans SuiviTerrain (semaine 6) : 
-Afficher les points de vente sur une carte, géocoder automatiquement les adresses, tracer les tournées des agents.
Option A : Google Maps JavaScript API
Option B : Leaflet + OpenStreetMap (gratuit, sans clé)
10. OUTILS COMPLÉMENTAIRES
----Postman
Signification : Outil pour tester des API REST sans écrire de code.
Rôle dans SuiviTerrain : 
-Vérifier que votre API Flask fonctionne correctement avant de la connecter à React.
----pytest
Signification : Framework de test pour Python.
Rôle dans SuiviTerrain (semaine 8) : 
-Automatiser les tests pour vérifier que votre code ne se casse pas après chaque modification.
----Gunicorn
Signification : Serveur WSGI pour Python. Il fait tourner Flask en production (plus robuste que le serveur de développement).
Rôle dans SuiviTerrain : 
-Servir l'application Flask une fois déployée sur Render/Railway.