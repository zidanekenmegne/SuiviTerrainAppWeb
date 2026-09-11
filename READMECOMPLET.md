# Je vais construire une apllication web permettant à une entreprise de recenser ses points de vente ou ses clients sur une carte, de planifier les visites de ses agents commerciaux et de suivre les comptes rendus de ces visites
admin@suiviterrain.com	admin123	Administrateur
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
# **Environnement virtuel: c'est une boîte isolée pour mes dépendances, pour ne pas polluer mon Python global 
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


# ** Dépôt GiHub
    # 1. Initialiser Git
    git init
    # 2. Créer .gitignore (manuellement avec VS Code ou touch)
    # 3. Vérifier le statut
    git status
    # 4. Ajouter les fichiers
    git add .
    # 5. Faire le premier commit
    git commit -m "initial: structure du projet SuiviTerrain"
    # 6. Voir l'historique
    git log --oneline
    # 7. Ajouter le remote GitHub
    git remote add origin https://github.com/VOTRE-PSEUDO/SuiviTerrain.git
    # 8. Pousser
    git push -u origin master



# *** Le PLAN D'ÉVOLUTION - SuiviTerrain
* SEMANE 1 : FONDATIONS ET ENVIRONNEMENT
---Technologies : Git, GitHub, Python 3, venv (environnement virtuel), pip, VS Code
---Rôle de chaque technologie : Git versionne votre code et GitHub l'héberge en ligne ; Python 3 est le langage principal ; venv isole vos dépendances ; pip installe les bibliothèques ; VS Code est l'éditeur de code.
---Livrable : Dépôt GitHub initialisé avec README.md, .gitignore, environnement virtuel fonctionnel et script de gestion de contacts en Python orienté objet avec persistance JSON, démontrant une maîtrise des commits atomiques et des branches.

* SEMAINE 2 : INTERFACE STATIQUE PROFESSIONNELLE
---Technologies à utiliser : HTML sémantique, CSS (Flexbox/Grid), Bootstrap 5, JavaScript (DOM, fetch, async/await), données JSON fictives, GitHub Pages
---Rôle de chaque technologie : HTML structure le contenu ; CSS et Bootstrap 5 rendent l'interface responsive et professionnelle sans écrire de CSS personnalisé ; JavaScript manipule le DOM, filtre les données et gère les événements sans rechargement de page ; les données JSON fictives simulent la base de données ; GitHub Pages héberge la maquette statique.
---Livrable : Maquette statique complète, responsive et navigable de 7 écrans (connexion, tableau de bord, liste des points de vente, fiche détaillée, planning des visites, carte, gestion des utilisateurs) avec filtre et tri dynamiques en JavaScript, testée sur téléphone, tablette et ordinateur, hébergée sur GitHub Pages.

* SEMAINE 3 : MODÉLISATION ET BASE DE DONNÉES
---Technologies à utiliser : PostgreSQL, pgAdmin, psql, draw.io ou Looping (MCD/MLD), SQL (DDL, DML, DQL)
---Rôle de chaque technologie : PostgreSQL est le SGBDR qui stocke durablement vos données ; pgAdmin offre une interface graphique pour visualiser et administrer la base ; psql permet l'interaction en ligne de commande ; draw.io/Looping sert à modéliser le MCD et le MLD ; SQL crée les tables (DDL), insère les données de test (DML) et interroge la base (DQL).
---Livrable : Dossier database/ contenant le MCD illustrant les relations et cardinalités, le MLD en 3ème forme normale, le script schema.sql de création des 5 tables (utilisateurs, catégories, points de vente, visites, journal_connexion) avec toutes les contraintes (clés primaires, étrangères, valeurs par défaut, vérifications), le script seed.sql avec 50+ données réalistes, et requetes.sql contenant 15 requêtes de difficulté croissante commentées.

* SEMAINE 4 : BACK-END ET CRUD COMPLET
---Technologies à utiliser : Flask, Jinja2, Flask-SQLAlchemy, Flask-Migrate, Flask-WTF, PostgreSQL, Blueprints, python-dotenv

---Rôle de chaque technologie : Flask transforme votre code Python en serveur web ; Jinja2 génère les pages HTML dynamiques en injectant les données de la base ; Flask-SQLAlchemy est l'ORM qui relie Flask à PostgreSQL sans écrire de SQL brut ; Flask-Migrate gère les évolutions du schéma de base ; Flask-WTF crée et valide les formulaires ; Blueprints organisent le code en modules séparés ; python-dotenv protège les secrets (mots de passe, clés).

---Livrable : Application Flask version 1 fonctionnant en local, connectée à PostgreSQL, avec CRUD complet (Créer, Lire, Mettre à jour, Supprimer) pour les points de vente et les visites, intégration des gabarits Jinja2 héritant d'un template de base, formulaires avec validation, téléversement sécurisé des photos, recherche/filtrage/pagination sur la liste des points de vente, et architecture organisée en Blueprints (models/, routes/, templates/).


* SEMAINE 5 : SÉCURITÉ, AUTHENTIFICATION ET API REST
---Technologies à utiliser : Flask-Login, bcrypt/werkzeug.security (hachage), décorateurs personnalisés, Flask-CORS, Postman, JWT (optionnel)

---Rôle de chaque technologie : Flask-Login gère les sessions utilisateur (connexion, déconnexion, protection des routes) ; bcrypt/werkzeug hache les mots de passe avec un sel pour les stocker de manière sécurisée ; les décorateurs personnalisés protègent les routes selon le rôle (admin/agent) ; Flask-CORS autorise les requêtes depuis React en développement ; Postman teste et documente l'API REST ; JWT (optionnel) peut remplacer les sessions pour une API plus stateless.

---Livrable : Application sécurisée avec inscription, connexion, déconnexion, hachage des mots de passe, journal des connexions, gestion des rôles admin/agent avec décorateurs restreignant l'accès, API REST versionnée ( /api/v1/ ) exposant les ressources points de vente et visites avec les 4 opérations CRUD, codes de statut HTTP appropriés (200, 201, 400, 401, 403, 404), collection Postman complète exportée dans le dépôt couvrant les cas nominaux et d'erreur.


* SEMAINE 6 : CARTOGRAPHIE ET SERVICES TIERS
---Technologies à utiliser : OpenStreetMap (OSM), Leaflet.js, Nominatim (géocodage), OSRM ou Leaflet Routing Machine (itinéraires), variables d'environnement, API Fetch

---Rôle de chaque technologie : OpenStreetMap fournit les fonds de carte gratuits ; Leaflet.js est la bibliothèque JavaScript qui affiche la carte interactive ; Nominatim convertit une adresse texte en coordonnées GPS (géocodage) ; OSRM/Leaflet Routing Machine calcule et trace les itinéraires ; les variables d'environnement protègent les clés API (même si OSM est gratuit, bonne pratique) ; Fetch appelle les API tierces depuis le frontend.

---Livrable : Module de cartographie intégré à l'application affichant tous les points de vente avec des marqueurs colorés par catégorie, géocodage automatique des adresses à la création d'un point de vente, calcul et affichage de l'itinéraire des visites planifiées d'un agent pour une journée donnée, gestion explicite des erreurs (réseau, adresse introuvable, API indisponible), et solution de repli documentée.


* SEMAINE 7 : FRONT-END MODERNE AVEC REACT
---Technologies à utiliser : React 18, Vite, React Router DOM, Axios ou Fetch API, hooks (useState, useEffect), JavaScript ES6+, npm

---Rôle de chaque technologie : React construit l'interface utilisateur dynamique avec des composants réutilisables ; Vite est l'outil de build ultra-rapide pour le développement et la production ; React Router DOM gère la navigation entre les pages sans rechargement ; Axios/Fetch API consomme l'API REST Flask ; les hooks useState et useEffect gèrent l'état local et les appels API ; npm installe et gère toutes les dépendances Node.js.

---Livrable : Projet React initialisé avec Vite dans le dossier frontend/, consommant l'API Flask (semaine 5), avec composants de liste, carte-résumé, filtre, fiche détaillée, tableau de bord enrichi d'indicateurs calculés (nombre de visites par semaine, répartition par catégorie, visites en retard), gestion des états de chargement, d'erreur et de résultat vide, navigation avec React Router, et note comparative écrite entre l'approche Jinja2 et React.


* SEMAINE 8 : QUALITÉ, DÉPLOIEMENT ET RESTITUTION
---Technologies à utiliser : pytest, GitHub Actions (CI/CD), Gunicorn, Render/Railway/PythonAnywhere, PostgreSQL (version hébergée), documentation Markdown, support de présentation

---Rôle de chaque technologie : pytest exécute automatiquement les tests unitaires et d'intégration ; GitHub Actions lance les tests à chaque push (intégration continue) ; Gunicorn est le serveur WSGI de production pour Flask ; Render/Railway/PythonAnywhere hébergent l'application en ligne ; PostgreSQL hébergé est la base de données en production ; la documentation technique explique l'installation et la configuration ; le support de présentation synthétise le projet pour la soutenance.

---Livrable : Application complète déployée et accessible publiquement en ligne, suite de tests automatisés (15+ tests couvrant modèles, routes principales, API) avec intégration continue verte sur GitHub Actions, dossier de conception (MCD, MLD, scripts SQL), documentation technique complète (installation, configuration, description de l'API), rapport de stage de 15-20 pages, support de présentation, journal de bord des 8 semaines, et démonstration finale réussie devant l'encadreur.

# ** SEMAINE 1 : Terminée avec gestionnaire de contacts construit

# ** SEMAINE 2: Construction des maquettes des différentes pages de l'Application
Les principales pages sont: 
    Page:           Rôle:
    1. Connexion: Authentification utilisateur  
    2. Tableau de bord: Indicateurs clés + visites récentes
    3. Liste des visites: Filtrage par statut (toutes/en cours/réalisées/en attente)	
    4. Détail d'une visite: Informations complètes + progression des visites	
    5. Carte: Visualisation géographique des visites	
    6. Profil: Informations de un agent + ses points assignés	
    7. Historique: Traçabilité des visites passées	
    8. Notifications: Alertes et rappels
    9. Paramètres: Configuration compte/préférences	

# **Création de toutes les 7 pages principales et des pages sécondaires comme paremètres....:
- Structure : HTML pur avec separation CSS/JS
- Design : Carte centree avec formulaire, oeil pour le mot de passe
- Recherche dynamique en tepms réel des points de vente
- Validation : Champs obligatoires, simulation de connexion
- Responsive : Adapte a toutes les tailles d'ecran (mobile-first)

Technologies : Bootstrap 5, Bootstrap Icons, Google Fonts (Segoe UI), OpenStreetMap

# ** # Les plus grandes difficultés rencontrées pour cette période du projet sont:
Pendant cette phase de construction des maquettes, j'ai renontré plusieurs difficultés:
- 1-Premièrement: Intégration du favicon et des logos
    J'ai placé le dossier favicon dans frontend/public/ mais les chemins d’accès relatifs (../assets/images/) ne correspondaient pas toujours.

- 2-Deuxièmement:  Illisibilité et difficulté de maintenance des fichiers
    Pour chaque page, j'ai mélangé les lignes de code html, css et js dans un même fichier
  Cette approche rendait mon code touffu et difficile de me rtrouver malgré les commentaires insérés.

- 3- Troisièmement: Superposition des modales (Points / Catégories)
    Dans la gestion des modales des formulaires d'ajout, j'ai superposé des modales (Points / Catégories) ce qui faisait que les deux formulaires modales s’ouvraient en même temps

- 4- Quatrièmement: Menus hamburger non fonctionnels
    Le menu ne s’ouvrait pas car le code était placé en dehors du DOMContentLoaded dans certains fichiers JS

- 5-Cinquièmement: Bouton + mobile non contextuel
    Le bouton '+' sur les interfaces mobiles ouvrait toujours la même modale d'ajout d'une visite, quel que soit l’onglet actif.

- 6-Sixièmement: Déploiement sur GitHub Pages (erreur 404)
    Malgré que GitHub Pages avait déjà généré le lien pour le site, la page de rédirection index.html ne renvoiyait pas vers la page d'accueil et GitHub Pages ne proposait pas le dossier frontend/ dans les options de publication (uniquement /root et /docs).
# ** # Les solutions que j'ai apporté pour sésoudre ces difficultés sont:
- 1- J'ai déplacé le dossier dans le dossier assts/images de frontend et j'ai modifié le chemin d'accès.
- 2- J'ai transformé chaque fichier entier en 3 fichiers html, css et js disctincs et j'ai utilisé les liens link pour tous les relier
- 3- Ici, j'ai corrigé ce prblème en fermant l’autre modale avant d’ouvrir la nouvelle.
- 4- Il fallait déplacer la logique à l’intérieur du DOMContentLoaded dans les fichiers JS concernés.
- 5- J'ai rendu son comportement dynamique avec updateActionButton() qui vérifiait à chaque fois la page sur laquelle l'utilisateur se trouve.
- 6- Pour le résoudre, j’ai créé un fichier .nojekyll à la racine du dépôt, ce qui force GitHub Pages à ignorer le traitement Jekyll et à publier l’intégralité du dépôt. Ensuite, j’ai accédé au site via l’URL https://zidanekennegne.github.io/SuiviTerrainAppWeb/frontend/pages/tableau-bord.html.

# *** SEMAINE 3 : MODÉLISATION ET BASE DE DONNÉES
Cette semaine, j’ai modélisé et construit la base de données relationnelle de SuiviTerrain. J’ai commencé par un MCD complet avec les entités UTILISATEUR, CATEGORIE, POINT_DE_VENTE, VISITE et JOURNAL_CONNEXION, en définissant précisément leurs attributs, leurs clés primaires et leurs cardinalités (1,n / 1,1). J’ai ensuite traduit ce MCD en MLD, en ajoutant la table d’association REALISER pour gérer la relation many-to-many entre les utilisateurs et les visites. J’ai validé les trois formes normales (1NF, 2NF, 3NF) pour garantir l’intégrité et l’absence de redondances. J’ai écrit et exécuté le script schema.sql pour créer les six tables dans PostgreSQL, puis le script seed.sql pour insérer des données de test (utilisateurs, catégories, points de vente, visites, associations et connexions). J’ai également rédigé un fichier requetes.sql avec des requêtes de sélection, filtrage, jointures (INNER et LEFT), agrégations, sous‑requêtes, mises à jour et suppressions. Enfin, j’ai réalisé une sauvegarde complète et testé la restauration sur une base vierge, validant ainsi la portabilité du schéma. La base est maintenant fonctionnelle, peuplée et prête à être interrogée par l’application Flask.

# ** SEMAINE 4 : BACK-END ET CRUD COMPLET
Les objectifs de cette semaine sont : 
 - Connecter Flask à PostgreSQL: Utiliser SQLAlchemy pour lier l'application à la base
 - Créer les modèles SQLAlchemy: Pour transformer le schéma SQL en classes Python
 - CRUD complet: Implémenter Create, Read, Update, Delete pour les points de vente et les visites
 - Gabarits Jinja2: Ils vont remplacer les pages HTML statiques par des templates dynamiques
 - Recherche, filtrage, pagination: Ajouter des fonctionnalités interactives

Aborescence des nouveaux fichiers:
    SuiviTerrain/
    ├── backend/
    │   ├── app.py                 # Point d'entrée de l'application
    │   ├── config.py              # Configuration (base de données, secrets)
    │   ├── models.py              # Modèles SQLAlchemy
    │   ├── requirements.txt       # Dépendances Python
    │   ├── .env                   # Variables d'environnement (non commité)
    │   ├── migrations/            # Géré par Flask-Migrate (à créer)
    │   ├── routes/                # (Optionnel) Découpage des routes
    │   │   ├── auth.py
    │   │   ├── points.py
    │   │   └── visites.py
    │   └── templates/             # Gabarits Jinja2
    │       ├── base.html
    │       ├── tableau-bord.html
    │       ├── points-vente.html
    │       ├── detail-point.html
    │       └── ...
    └── frontend/                  # (Maquette statique - conservée)

e premier objectif de cette semaine était de transformer la maquette statique en une application dynamique en connectant Flask à PostgreSQL via SQLAlchemy, afin que les données affichées ne soient plus fictives mais bien issues de la base de données. J'ai ainsi créé les modèles correspondant aux tables et mis en place les routes pour afficher les listes de points de vente, de visites, de catégories et d'utilisateurs. Les templates Jinja2 ont remplacé les fichiers HTML statiques, avec un héritage via base.html pour mutualiser la navigation et le footer.

Le deuxième objectif était d'implémenter un CRUD complet pour les quatre entités principales, permettant à l'utilisateur d'ajouter, de modifier et de supprimer des données via des formulaires sécurisés. Chaque formulaire a été enrichi d'une validation côté client avec des messages d'erreur sous les champs, et d'une validation côté serveur pour garantir l'intégrité des données. Les champs comme le téléphone ou l'email sont désormais contrôlés, et les dates de visite ne peuvent pas être dans le passé.

Le troisième objectif concernait les fonctionnalités avancées : le géocodage automatique des adresses via l'API Nominatim, l'upload de photos avec sécurisation et renommage, ainsi que la recherche en temps réel sur toutes les listes. Les messages flash informent l'utilisateur du succès ou des erreurs, et disparaissent automatiquement après cinq secondes. Toutes ces interactions se font sans rechargement de page grâce à JavaScript.

Le dernier objectif visait à garantir une expérience utilisateur fluide et professionnelle, avec des formulaires qui conservent les champs valides même en cas d'erreur, des bordures rouges et des messages explicites sous chaque champ problématique. L'ensemble est responsive et utilise Bootstrap 5, et les données sont systématiquement validées avant d'être envoyées à la base. L'application est désormais fonctionnelle en local et prête à être déployée.
  # Problème rencontré pour cette semaine 
Le principal problème a été l'absence de messages flash, causée par un script auto-fermant mal placé qui supprimait les alertes avant leur affichage ; j'ai déplacé les messages dans un conteneur fixe en haut à droite et corrigé le script. L'installation de psycopg2-binary a échoué sous Windows, j'ai dû utiliser une version pré-compilée et passer par WSL2 pour la compilation. Enfin, les validations front-end étaient absentes, ce qui vidait tous les champs du formulaire en cas d'erreur ; j'ai ajouté des attributs HTML5, des messages invalid-feedback et du JavaScript pour valider en temps réel et conserver les données saisies.

-------------------
Cette semaine a marqué le passage du front-end statique au back-end dynamique avec Flask, SQLAlchemy et PostgreSQL. J'ai structuré le projet avec un dossier backend contenant app.py, config.py, models.py, et les templates Jinja2. Les modèles SQLAlchemy ont été créés pour les entités utilisateur, catégorie, point de vente, visite et journal de connexion, avec la table d'association realiser. Les routes CRUD complètes ont été implémentées pour chaque entité, avec des formulaires d'ajout et de modification. Le géocodage automatique via Nominatim convertit les adresses en coordonnées GPS, et l'upload de photos sécurise les fichiers. Les recherches en temps réel sur toutes les listes et les validations front-end et back-end améliorent l'expérience utilisateur. Les messages flash apparaissent en haut à droite et disparaissent après cinq secondes. L'application est désormais fonctionnelle avec toutes ses fonctionnalités de gestion des données, et la base est prête pour l'étape suivante. Les prochains développements incluront l'authentification et l'API REST. Cette semaine a permis de consolider les bases du projet et de le rendre pleinement opérationnel avant les semaines dédiées à la sécurité et au déploiement
----------------------------

# **Semaine 5: Flask login...
Objectif : Sécuriser l'application SuiviTerrain avec une authentification robuste (Flask-Login + JWT), gérer les rôles (admin/agent), tracer les connexions, et exposer une API REST complète pour les points de vente et les visites.

Réalisations : Mise en place de l'inscription, connexion, déconnexion avec hachage des mots de passe (bcrypt/werkzeug). Protection des routes avec @login_required et décorateurs personnalisés pour les rôles. Ajout du journal des connexions (table journal_connexion). Création d'une API REST versionnée (/api/v1/) avec endpoints pour points, visites, catégories et statistiques. Authentification JWT avec tokens, pagination, gestion uniforme des erreurs, rate limiting (100 requêtes/min) et CORS configuré. Tests effectués avec Thunder Client pour valider les cas nominaux et d'erreur.

Problèmes rencontrés : 1- Erreur "Subject must be a string" due à l'identifiant utilisateur (int) passé à create_access_token()  2- Warnings sur la clé JWT trop courte   3- Doublon de fonction api_get_categories dans api.py  . 4- Avertissement sur le stockage in-memory de Flask-Limiter à configurer en production avec Redis.
1- solution : convertir en str(user.id_user).
2- solution : ajout de JWT_SECRET_KEY dans config.py.
3- solution : suppression de la redondance
4- solution : à configurer en production avec Redis.

# **Semaine 7 : Interface React
L'objectif de cette semaine est de reconstruire la partie frontend de SuiviTerrain en React.
L'application React consomme l'API Flask développée en semaine 5, et reprend les fonctionnalités de la maquette statique de la semaine 2, avec une expérience utilisateur fluide.

