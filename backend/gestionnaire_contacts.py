"""
gestionnaire_contacts.py - Gestion de contacts avec persistance JSON

Fonctionnalités :
- Ajouter un contact
- Modifier un contact (par email)
- Supprimer un contact (par email)
- Afficher tous les contacts
- Sauvegarde automatique dans contacts.json
- Chargement automatique au démarrage
"""

import json
import os  # ← os permet de vérifier si un fichier existe


class GestionnaireContact:
    """
    Gère une liste de contacts avec persistance dans un fichier JSON.
    Chaque contact est un dictionnaire avec les clés : nom, prenom, telephone, email.
    """
    
    def __init__(self):
        """
        Constructeur : initialise la liste de contacts et charge les données existantes.
        """
        self.storage = []  # Liste qui contiendra tous les contacts (des dictionnaires)
        self.fichier = "contacts.json"  # Nom du fichier de sauvegarde
        self.charger()  # ← On charge automatiquement au démarrage !
    
    # MÉTHODE : CHARGER LES DONNÉES
    def charger(self):
        """
        Charge les contacts depuis le fichier JSON s'il existe.
        Si le fichier n'existe pas, on garde une liste vide.
        """
        # 1. Vérifier si le fichier existe
        if os.path.exists(self.fichier):
            try:
                # 2. Ouvrir le fichier en lecture
                with open(self.fichier, 'r', encoding='utf-8') as f:
                    # 3. Charger le contenu JSON → liste de dictionnaires
                    donnees = json.load(f)
                    # 4. Stocker dans self.storage
                    self.storage = donnees
                print(f"{len(self.storage)} contacts chargés depuis {self.fichier}")
            except (json.JSONDecodeError, FileNotFoundError):
                # En cas d'erreur (fichier corrompu), on repart de zéro
                print("Fichier corrompu. Départ avec une liste vide.")
                self.storage = []
        else:
            print(f"Aucun fichier {self.fichier} trouvé. Départ avec une liste vide.")
    
    # MÉTHODE : SAUVEGARDER LES DONNÉES
    def sauvegarder(self):
        """
        Sauvegarde TOUS les contacts dans le fichier JSON.
        Cette méthode est appelée après chaque modification (ajout, modif, suppression).
        """
        try:
            with open(self.fichier, 'w', encoding='utf-8') as f:
                json.dump(self.storage, f, indent=2, ensure_ascii=False)
            print(f"{len(self.storage)} contacts sauvegardés dans {self.fichier}")
        except Exception as e:
            print(f"Erreur lors de la sauvegarde : {e}")
    
    # MÉTHODE : AJOUTER UN CONTACT
    def ajouter(self):
        """
        Demande les informations à l'utilisateur et ajoute un nouveau contact.
        """
        print("\n--- Ajout d'un nouveau contact ---")
        
        # 1. Demander les informations
        nom = input("Entrer le nom : ").strip()
        prenom = input("Entrer le prénom : ").strip()
        telephone = input("Entrer le téléphone : ").strip()  # ← str, pas int !
        email = input("Entrer l'adresse email : ").strip()
        
        # 2. Vérifier que tous les champs sont remplis
        if not all([nom, prenom, telephone, email]):
            print("Tous les champs sont obligatoires.")
            return

        # Validation email 
        elif '@' not in email or '.' not in email:
            print("Adresse mail incorrect ! Il manque '@' ou '.'")
            return
        elif email.count('@') != 1:
            print("Adresse mail incorrect ! Un seul '@' autorisé")
            return
        elif email.startswith('@') or email.endswith('.'):
            print("Adresse mail incorrect ! L'email ne peut pas commencer par '@' ni finir par '.'")
            return
        elif not telephone.isdigit():
            print("Télephone incorrect. Utilisez des chiffres")
            return
        # 3. Créer un dictionnaire pour le contact
        contact = {
            "nom": nom,
            "prenom": prenom,
            "telephone": telephone,
            "email": email
        }
        
        # 4. Ajouter à la liste
        self.storage.append(contact)
        
        # 5. Sauvegarder immédiatement
        self.sauvegarder()
        
        print(f"Contact ajouté : {prenom} {nom}")
    
    
    # MÉTHODE : MODIFIER UN CONTACT
    def modifier(self):
        """
        Modifie un contact existant en recherchant par son email.
        """
        print("\n--- Modification d'un contact ---")
        
        # 1. Demander l'email du contact à modifier
        email_recherche = input("Entrer l'email du contact à modifier : ").strip()
        
        # 2. Parcourir la liste pour trouver le contact
        for i, contact in enumerate(self.storage):
            if contact["email"] == email_recherche:
                # 3. Contact trouvé ! On demande les nouvelles informations
                print(f"Contact trouvé : {contact['prenom']} {contact['nom']}")
                print("Remplissez les nouvelles données (laissez vide pour ne pas modifier) :")
                
                nouveau_nom = input(f"Nouveau nom ({contact['nom']}) : ").strip()
                nouveau_prenom = input(f"Nouveau prénom ({contact['prenom']}) : ").strip()
                nouveau_telephone = input(f"Nouveau téléphone ({contact['telephone']}) : ").strip()
                nouveau_email = input(f"Nouvel email ({contact['email']}) : ").strip()
                
                # 4. Mettre à jour (garder l'ancienne valeur si le champ est vide)
                if nouveau_nom:
                    contact["nom"] = nouveau_nom
                if nouveau_prenom:
                    contact["prenom"] = nouveau_prenom
                if nouveau_telephone:
                    contact["telephone"] = nouveau_telephone
                if nouveau_email:
                    contact["email"] = nouveau_email
                
                # 5. Sauvegarder après modification
                self.sauvegarder()
                print(f"Contact modifié : {contact['prenom']} {contact['nom']}")
                return
        
        # 6. Si on sort de la boucle, le contact n'a pas été trouvé
        print(f"Aucun contact trouvé avec l'email : {email_recherche}")
    
    # MÉTHODE : SUPPRIMER UN CONTACT
    def supprimer(self):
        """
        Supprime un contact existant en recherchant par son email.
        """
        print("\n--- Suppression d'un contact ---")
        
        # 1. Demander l'email du contact à supprimer
        email_recherche = input("Entrer l'email du contact à supprimer : ").strip()
        
        # 2. Parcourir la liste pour trouver le contact
        for i, contact in enumerate(self.storage):
            if contact["email"] == email_recherche:
                # 3. Contact trouvé ! On supprime
                contact_supprime = self.storage.pop(i)
                print(f"🗑️  Contact supprimé : {contact_supprime['prenom']} {contact_supprime['nom']}")
                
                # 4. Sauvegarder après suppression
                self.sauvegarder()
                return
        
        # 5. Si on sort de la boucle, le contact n'a pas été trouvé
        print(f"Aucun contact trouvé avec l'email : {email_recherche}")
    
    # MÉTHODE : AFFICHER TOUS LES CONTACTS
    def afficher_tout(self):
        """
        Affiche la liste complète des contacts.
        """
        if not self.storage:
            print("📭 Aucun contact dans la liste.")
            return
        
        print("\n" + "="*50)
        print("LISTE DES CONTACTS")
        print("="*50)
        
        for i, contact in enumerate(self.storage, start=1):
            print(f"{i}. {contact['prenom']} {contact['nom']} | Tél: {contact['telephone']} | Email: {contact['email']}")
        
        print("="*50)
        print(f"Total : {len(self.storage)} contacts\n")
    
    # MÉTHODE : CONVERTIR EN JSON (DÉJÀ INTÉGRÉE DANS SAUVEGARDER)
    # La méthode sauvegarder() fait déjà la conversion JSON.
    def convert_to_json(self):
        """
        Appelle sauvegarder() pour convertir en JSON.
        (Méthode conservée pour ne pas casser votre ancien code)
        """
        self.sauvegarder()
        return "Conversion JSON effectuée !"

# PARTIE PRINCIPALE : MENU INTERACTIF
def menu():
    """
    Interface en ligne de commande pour utiliser le gestionnaire.
    """
    gestionnaire = GestionnaireContact()
    
    print("GESTIONNAIRE DE CONTACTS")
    print("="*50)
    
    while True:
        print("\n" + "-"*40)

        print("MENU PRINCIPAL")
        print("-"*40)
        print("1. Ajouter un contact")
        print("2. Modifier un contact")
        print("3. Supprimer un contact")
        print("4. Afficher tous les contacts")
        print("5. Quitter")
        print("-"*40)
        
        choix = input("Votre choix (1-5) : ").strip()
        
        if choix == "1":
            gestionnaire.ajouter()
        elif choix == "2":
            gestionnaire.modifier()
        elif choix == "3":
            gestionnaire.supprimer()
        elif choix == "4":
            gestionnaire.afficher_tout()
        elif choix == "5":
            print("\n Au revoir ! Les contacts ont été sauvegardés.")
            break
        else:
            print("Choix invalide. Veuillez saisir un nombre entre 1 et 5.")


# POINT D'ENTRÉE
if __name__ == "__main__":
    menu()