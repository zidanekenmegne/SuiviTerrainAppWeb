"""
Script pour créer des visites du jour et les lier à l'utilisateur
Exécution : python seed_today.py
"""

from app import app
from models import db, Visite, PointDeVente, Utilisateur, realiser
from datetime import datetime, date, time

def seed_today_visits():
    with app.app_context():
        # 1. Trouver l'utilisateur "Agent test"
        user = Utilisateur.query.filter(
            Utilisateur.nom_user.ilike('%agent%')
        ).first()
        
        if not user:
            print("❌ Aucun utilisateur 'Agent' trouvé.")
            print("   Utilisateurs disponibles :")
            for u in Utilisateur.query.all():
                print(f"   - ID {u.id_user}: {u.nom_user} ({u.mail}) - {u.role}")
            return
        
        print(f"✅ Utilisateur : {user.nom_user} (ID: {user.id_user})")
        print(f"   Email : {user.mail} | Rôle : {user.role}")
        
        # 2. Récupérer 5 points de vente
        points = PointDeVente.query.limit(5).all()
        
        if not points:
            print("❌ Aucun point de vente trouvé.")
            return
        
        print(f"✅ {len(points)} points de vente récupérés")
        
        # 3. Supprimer les anciennes visites du jour
        today = date.today()
        old_visits = Visite.query.filter_by(date_prevue=today).all()
        for v in old_visits:
            # Supprimer les liens dans realiser d'abord
            db.session.execute(
                realiser.delete().where(realiser.c.id_visite == v.id_visite)
            )
            db.session.delete(v)
        db.session.commit()
        if old_visits:
            print(f"🗑️  {len(old_visits)} anciennes visites supprimées")
        
        # 4. Créer 5 visites du jour
        heures = [time(8, 0), time(9, 30), time(11, 0), time(14, 0), time(16, 0)]
        statuts = ['planifiee', 'encours', 'attente', 'planifiee', 'planifiee']
        
        created_count = 0
        for i, point in enumerate(points):
            visite = Visite(
                date_prevue=today,
                heure_prevue=heures[i],
                statut=statuts[i],
                id_pt=point.id_pt,
                date_creation=datetime.now()
            )
            db.session.add(visite)
            db.session.flush()
            
            # Lien avec l'utilisateur (table realiser)
            db.session.execute(
                realiser.insert().values(
                    id_user=user.id_user,
                    id_visite=visite.id_visite
                )
            )
            created_count += 1
            print(f"  ✓ Visite #{visite.id_visite} → {point.nom_pt} à {heures[i]}")
        
        db.session.commit()
        print(f"\n✅ {created_count} visites créées pour aujourd'hui ({today})")
        print(f"✅ Toutes liées à l'utilisateur : {user.nom_user}")
        print(f"\n🎯 Test : Connecte-toi avec {user.mail} et va sur la carte")

if __name__ == '__main__':
    seed_today_visits()