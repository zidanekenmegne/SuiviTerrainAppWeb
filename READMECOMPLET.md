Objectifs de la semaine
L'objectif principal de cette semaine était de reconstruire intégralement la partie frontend de SuiviTerrain en React, en consommant l'API REST Flask développée en semaine 5. Il s'agissait de remplacer l'approche Jinja2 (rendu côté serveur) par une architecture SPA (Single Page Application) offrant une expérience utilisateur plus fluide et moderne.

Les objectifs spécifiques étaient les suivants : initialiser un projet React avec Vite dans le dossier frontend/ ; configurer la communication avec Flask via un proxy Vite pour éviter les problèmes de CORS ; migrer les maquettes statiques (semaine 2) en composants React réutilisables ; consommer l'API REST Flask (points, catégories, visites, utilisateurs, stats, notifications) ; gérer les états de chargement, d'erreur et de résultat vide sur chaque appel API ; mettre en place la navigation avec React Router sans rechargement de page ; découper l'interface en composants maintenables et tester chaque fonctionnalité ; adapter l'interface aux écrans mobiles et PC (approche mobile-first).

Technologies utilisées
React 18.x est la bibliothèque UI à composants réutilisables. Vite 5.x assure le build ultra-rapide avec HMR (Hot Module Replacement). React Router DOM 6.x gère la navigation SPA entre les pages. Axios 1.x est le client HTTP pour consommer l'API REST Flask. Bootstrap 5.3 est le framework CSS responsive. Bootstrap Icons 1.10 fournit les icônes vectorielles. Leaflet 1.9 affiche la carte interactive avec OpenStreetMap. React Bootstrap 2.x apporte les composants Bootstrap en React.

Architecture du projet React
L'application a été structurée en dossiers clairs pour séparer les responsabilités. Le dossier api/ contient la configuration Axios et les intercepteurs JWT. Le dossier components/ regroupe les composants réutilisables par domaine métier (auth, carte, dashboard, historique, notifications, parametres, planning, points, profil, rapports, utilisateurs, visites). Le dossier contexts/ contient les contextes React globaux (Auth, Toast, Notifications). Le dossier hooks/ héberge les hooks personnalisés pour la logique métier (10 hooks). Le dossier pages/ regroupe les 15 pages principales de l'application. Le dossier styles/ contient les CSS Modules organisés par composant et par page.

L'arborescence complète compte environ 60 composants, 10 hooks personnalisés, 3 contextes et 15 pages, pour un total d'environ 10 000 lignes de code frontend.

Fonctionnalités implémentées
Authentification
La page LoginPage et la page RegisterPage ont été créées avec validation côté client. Le AuthContext gère le token JWT, la connexion, la déconnexion et l'inscription. Un composant ProtectedRoute redirige automatiquement vers /login si l'utilisateur n'est pas authentifié. Deux intercepteurs Axios ont été mis en place : le premier ajoute automatiquement le token JWT à chaque requête, le second gère les erreurs 401 en déconnectant l'utilisateur si le token a expiré.

Dashboard
Le tableau de bord affiche les statistiques en temps réel (visites totales, réalisées, en cours, en attente), les 5 dernières visites récentes et des actions rapides vers les autres modules. Les données proviennent de l'API /stats et /visites?limit=4.

Points de vente
Le module Points de vente utilise un tableau conforme à la maquette de la semaine 2, avec les colonnes Nom, Catégorie (avec pastille de couleur), Contact, Adresse et Action. La recherche multi-mots fonctionne en temps réel, une modale d'ajout/modification permet le CRUD complet, et une modale de détail affiche la photo du point. Sur mobile, les colonnes Contact et Adresse sont masquées pour un meilleur confort visuel.

Catégories
La gestion des catégories permet d'afficher la liste avec leur couleur et le nombre de points associés. Une modale d'ajout/modification permet de créer ou modifier une catégorie, et la suppression est protégée par une confirmation.

Carte interactive
La carte Leaflet avec OpenStreetMap affiche tous les points de vente avec des marqueurs colorés par catégorie. Un itinéraire du jour est tracé en ligne rouge pointillée avec des numéros d'étapes, et une légende cliquable permet de filtrer les points par catégorie. La géolocalisation de l'utilisateur affiche un marqueur rouge, et un panel escamotable liste les points de vente à proximité avec leur distance calculée par la formule de Haversine.

Visites
La liste des visites propose des filtres par statut (Toutes, En cours, Réalisées, En attente, En retard) et une recherche multi-mots. La page de détail permet de modifier la visite et de changer son statut rapidement via une barre mobile. La création d'une nouvelle visite se fait via un formulaire complet, et la suppression est protégée par une confirmation.

Utilisateurs
Le module Utilisateurs (réservé aux administrateurs) permet de lister les utilisateurs avec recherche et tri, de créer un utilisateur, de modifier son rôle (admin ou agent), de l'activer ou le désactiver, et de le supprimer. La suppression de son propre compte est bloquée pour éviter les erreurs.

Profil
La page Profil affiche les informations personnelles, les statistiques personnelles (visites réalisées, en attente, points de vente), et permet de modifier le profil, changer le mot de passe, uploader une photo de profil (avec persistance en BDD) et se déconnecter.

Historique
L'historique liste toutes les visites passées avec des filtres par période (Toutes, Aujourd'hui, Cette semaine, Ce mois) et une recherche multi-mots. Le tri par date place les visites les plus récentes en premier.

Planning
Le planning propose un calendrier mensuel (PC) avec des points colorés par statut de visite, une navigation mois/jour, une sélection de date et une liste des visites du jour. Sur mobile, l'affichage passe en navigation jour par jour avec des flèches précédent/suivant.

Rapports
Le module Rapports affiche 4 cartes KPI (total, réalisées, en attente, taux de réussite), deux graphiques (répartition par statut et évolution mensuelle) et un tableau des performances par agent. Des filtres permettent de sélectionner la période, l'agent et le statut. Un bouton d'export (à implémenter ultérieurement) est prévu.

Paramètres
La page Paramètres contient trois sections : Compte (profil, sécurité), Préférences (notifications, mode hors ligne, langue) et Autres (à propos, déconnexion). Les toggles des préférences sont persistés dans le localStorage pour conserver les choix de l'utilisateur.

Notifications
Les notifications sont persistantes en base de données (table notification) et sont créées automatiquement lors de l'assignation d'une visite à un agent et lors du changement de statut d'une visite. La page Notifications propose des filtres (Toutes, Non lues, Lues), un bouton "Marquer comme lu", un bouton "Tout marquer comme lu" et un bouton "Supprimer". Un badge dynamique dans la Navbar affiche le nombre de notifications non lues et se rafraîchit automatiquement toutes les 60 secondes.

Communication Frontend ↔ Backend
Le proxy Vite a été configuré pour rediriger les requêtes /api et /static vers http://127.0.0.1:5000 en développement. Cela évite les problèmes de CORS et permet d'utiliser des URLs relatives dans le code React.

Axios a été configuré avec un baseURL de /api/v1 et deux intercepteurs. Le premier ajoute automatiquement le token JWT à chaque requête depuis le localStorage. Le second gère les erreurs 401 en déconnectant l'utilisateur et en le redirigeant vers /login.

Difficultés rencontrées et solutions
Difficulté 1 : Migration de maquette statique vers React
Les maquettes HTML/CSS/JS ne pouvaient pas être copiées telles quelles dans React. J'ai dû découper chaque page en composants réutilisables, extraire la logique métier dans des hooks personnalisés, utiliser des CSS Modules pour éviter les conflits de styles, et transformer le HTML en JSX (className, htmlFor, etc.).

Difficulté 2 : Gestion des données simulées vs API réelle
Au début du développement, j'ai utilisé des données simulées (mockData) pour construire les interfaces sans dépendre du backend. J'ai ensuite migré progressivement vers l'API réelle en centralisant tous les appels dans des hooks personnalisés (useCarte, useUtilisateurs, useProfil, etc.), puis supprimé toutes les données simulées.

Difficulté 3 : Alignement des statuts avec la contrainte BDD
La BDD n'accepte que les statuts planifiee, encours, realisee, attente, retard et annulee, mais le frontend utilisait planifie (sans e). J'ai dû corriger cette incohérence dans tous les composants concernés (VisiteEditModal, VisiteStatusBar, useVisiteDetail, VisiteInfoCard, VisiteDetailPage) et ajouter les styles CSS pour les statuts manquants.

Difficulté 4 : Erreur 500 lors de la création d'un point de vente
L'erreur était NULL viole la contrainte NOT NULL de la colonne latitude. J'ai résolu ce problème avec la commande SQL ALTER TABLE point_de_vente ALTER COLUMN latitude DROP NOT NULL, et en modifiant le modèle SQLAlchemy pour mettre nullable=True sur les colonnes latitude et longitude.

Difficulté 5 : Affichage mobile coupé
Les derniers éléments des listes étaient coupés par la BottomNav mobile qui est en position fixe. J'ai ajouté un padding-bottom de 200px sur le main du Layout en mobile, centralisé dans Layout.module.css pour ne pas dupliquer le code sur chaque page.

Difficulté 6 : Ordre des routes React Router
La route /visites/nouvelle était interprétée comme /visites/:id avec id="nouvelle", ce qui affichait la page de détail au lieu du formulaire de création. J'ai résolu ce problème en plaçant la route spécifique avant la route dynamique dans App.jsx.

Difficulté 7 : Notifications non liées à l'utilisateur
La table realiser (association Visite et Utilisateur) n'était pas remplie lors de la création d'une visite. J'ai modifié la route api_create_visite pour accepter un paramètre agent_id, insérer l'association dans realiser et créer automatiquement une notification pour l'agent assigné.

Difficulté 8 : Flask-Migrate non configuré
La commande flask db retournait "No such command 'db'". J'ai résolu ce problème en créant manuellement la table notification en SQL, en ajoutant le modèle dans models.py et en important Notification dans api.py.

Résultats obtenus
L'application React compte 15 pages, environ 60 composants, 10 hooks personnalisés et 3 contextes. Le temps de chargement moyen est inférieur à 500 ms et le score Lighthouse est supérieur à 90 sur les principaux critères de performance.

La couverture fonctionnelle est de 100% sur tous les modules : authentification, dashboard, points de vente, catégories, carte interactive, visites, détail visite, nouvelle visite, utilisateurs, profil avec photo, historique, planning, rapports, paramètres et notifications.

L'application est compatible avec Chrome 120 et supérieur, Firefox 121 et supérieur, Edge 120 et supérieur, Safari 17 et supérieur, ainsi que leurs versions mobiles.

Comparaison Jinja2 vs React
Approche Jinja2 (semaines 4-6)
Les avantages sont le rendu côté serveur (SEO-friendly), l'absence d'API séparée et un code Python unique. Les inconvénients sont le rechargement complet à chaque navigation, des interactions limitées, une moindre adaptation aux SPA modernes et une maintenance difficile avec beaucoup de pages.

Approche React (semaine 7)
Les avantages sont la navigation instantanée (SPA), des interactions fluides, des composants réutilisables, une séparation frontend/backend et un écosystème riche (npm). Les inconvénients sont la nécessité d'une API REST, un SEO plus complexe et un bundle initial plus lourd.

Choix retenu
React a été choisi pour quatre raisons principales. Premièrement, l'expérience utilisateur est nettement meilleure grâce à la navigation instantanée. Deuxièmement, la maintenabilité est facilitée par les composants réutilisables. Troisièmement, l'évolutivité permet d'ajouter facilement de nouvelles fonctionnalités. Quatrièmement, la séparation des responsabilités entre l'API Flask et l'UI React offre une meilleure architecture.

Livrables de la semaine 7
Les 16 livrables suivants ont été produits et validés : projet React initialisé avec Vite ; configuration du proxy Vite vers Flask ; pages Login et Register fonctionnelles ; Dashboard avec KPI ; module Points de vente avec CRUD complet ; module Catégories avec CRUD complet ; carte interactive avec itinéraire ; module Visites (liste, détail, création) ; module Utilisateurs (gestion admin) ; page Profil avec upload de photo ; Historique avec filtres ; Planning calendrier ; Rapports avec graphiques ; Paramètres ; Notifications persistantes ; note comparative Jinja2/React.

Conclusion
La semaine 7 a permis de transformer SuiviTerrain d'une application Flask/Jinja2 en une application full-stack moderne avec un backend Flask exposant une API REST, un frontend React consommant cette API, une expérience utilisateur fluide (SPA) et une architecture propre et maintenable.

Cette architecture est prête pour la production et peut être déployée sur des plateformes comme Vercel (frontend) et Render (backend). La semaine 8 sera consacrée aux tests automatisés (pytest), au déploiement en production, à l'intégration continue, à la documentation technique et au rapport de stage.

