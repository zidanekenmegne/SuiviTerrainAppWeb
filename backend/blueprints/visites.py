from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required
from models import db, Visite, PointDeVente
from datetime import datetime

visites_bp = Blueprint('visites', __name__, url_prefix='/visites')

@visites_bp.route('/')
@login_required
def liste():
    visites = Visite.query.order_by(Visite.date_prevue.desc()).all()
    return render_template('visites.html', visites=visites)

@visites_bp.route('/ajouter', methods=['GET', 'POST'])
@login_required
def ajouter():
    if request.method == 'POST':
        date_prevue = request.form.get('date_prevue')
        heure_prevue = request.form.get('heure_prevue')
        id_pt = request.form.get('point_vente')
        statut = request.form.get('statut', 'planifiee')
        compte_rendu = request.form.get('compte_rendu', '').strip()

        if not date_prevue or not heure_prevue or not id_pt:
            flash('Tous les champs obligatoires doivent être remplis.', 'danger')
            return redirect(url_for('visites.ajouter'))

        date_obj = datetime.strptime(date_prevue, '%Y-%m-%d').date()
        if date_obj < datetime.now().date():
            flash('La date ne peut pas être dans le passé.', 'danger')
            return redirect(url_for('visites.ajouter'))

        nouvelle_visite = Visite(
            date_prevue=date_obj,
            heure_prevue=datetime.strptime(heure_prevue, '%H:%M').time(),
            id_pt=int(id_pt),
            statut=statut,
            compte_rendu=compte_rendu if compte_rendu else None,
            date_creation=datetime.now()
        )

        db.session.add(nouvelle_visite)
        db.session.commit()
        flash('✅ Visite planifiée avec succès', 'success')
        return redirect(url_for('visites.liste'))

    points = PointDeVente.query.all()
    return render_template('ajouter-visite.html', points=points)

@visites_bp.route('/modifier/<int:id>', methods=['GET', 'POST'])
@login_required
def modifier(id):
    visite = Visite.query.get_or_404(id)

    if request.method == 'POST':
        date_prevue = request.form.get('date_prevue')
        heure_prevue = request.form.get('heure_prevue')
        id_pt = request.form.get('point_vente')
        statut = request.form.get('statut')
        compte_rendu = request.form.get('compte_rendu', '').strip()

        if not date_prevue or not heure_prevue or not id_pt:
            flash('Tous les champs obligatoires doivent être remplis.', 'danger')
            return redirect(url_for('visites.modifier', id=id))

        visite.date_prevue = datetime.strptime(date_prevue, '%Y-%m-%d').date()
        visite.heure_prevue = datetime.strptime(heure_prevue, '%H:%M').time()
        visite.id_pt = int(id_pt)
        visite.statut = statut
        visite.compte_rendu = compte_rendu if compte_rendu else None
        visite.date_modif = datetime.now()

        db.session.commit()
        flash('✅ Visite modifiée avec succès', 'success')
        return redirect(url_for('visites.liste'))

    points = PointDeVente.query.all()
    return render_template('modifier-visite.html', visite=visite, points=points)

@visites_bp.route('/supprimer/<int:id>')
@login_required
def supprimer(id):
    visite = Visite.query.get_or_404(id)

    if visite.statut == 'realisee':
        flash('Impossible de supprimer une visite déjà réalisée.', 'danger')
        return redirect(url_for('visites.liste'))

    db.session.delete(visite)
    db.session.commit()
    flash('🗑️ Visite supprimée avec succès', 'success')
    return redirect(url_for('visites.liste'))