from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required
from models import db, Categorie, PointDeVente
from datetime import datetime

categories_bp = Blueprint('categories', __name__, url_prefix='/categories')

def valider_nom(nom):
    return nom and len(nom.strip()) >= 2

@categories_bp.route('/')
@login_required
def liste():
    categories = Categorie.query.order_by(Categorie.nom_cat).all()
    return render_template('categories.html', categories=categories)

@categories_bp.route('/ajouter', methods=['GET', 'POST'])
@login_required
def ajouter():
    if request.method == 'POST':
        nom = request.form.get('nom', '').strip()
        couleur = request.form.get('couleur', '').strip()

        if not valider_nom(nom):
            flash('Le nom doit contenir au moins 2 caractères.', 'danger')
            return redirect(url_for('categories.ajouter'))

        if not couleur:
            flash('La couleur est obligatoire.', 'danger')
            return redirect(url_for('categories.ajouter'))

        if Categorie.query.filter_by(nom_cat=nom).first():
            flash('Cette catégorie existe déjà.', 'danger')
            return redirect(url_for('categories.ajouter'))

        nouvelle_categorie = Categorie(
            nom_cat=nom,
            couleur=couleur,
            date_creation_cat=datetime.now()
        )

        db.session.add(nouvelle_categorie)
        db.session.commit()
        flash('✅ Catégorie ajoutée avec succès', 'success')
        return redirect(url_for('categories.liste'))

    return render_template('ajouter-categorie.html')

@categories_bp.route('/modifier/<int:id>', methods=['GET', 'POST'])
@login_required
def modifier(id):
    categorie = Categorie.query.get_or_404(id)

    if request.method == 'POST':
        nom = request.form.get('nom', '').strip()
        couleur = request.form.get('couleur', '').strip()

        if not valider_nom(nom):
            flash('Le nom doit contenir au moins 2 caractères.', 'danger')
            return redirect(url_for('categories.modifier', id=id))

        if not couleur:
            flash('La couleur est obligatoire.', 'danger')
            return redirect(url_for('categories.modifier', id=id))

        categorie.nom_cat = nom
        categorie.couleur = couleur
        db.session.commit()
        flash('✅ Catégorie modifiée avec succès', 'success')
        return redirect(url_for('categories.liste'))

    return render_template('modifier-categorie.html', categorie=categorie)

@categories_bp.route('/supprimer/<int:id>')
@login_required
def supprimer(id):
    categorie = Categorie.query.get_or_404(id)

    points_associes = PointDeVente.query.filter_by(id_cat=id).count()
    if points_associes > 0:
        flash(f'Impossible de supprimer : {points_associes} point(s) utilisent cette catégorie.', 'danger')
        return redirect(url_for('categories.liste'))

    db.session.delete(categorie)
    db.session.commit()
    flash('🗑️ Catégorie supprimée avec succès', 'success')
    return redirect(url_for('categories.liste'))