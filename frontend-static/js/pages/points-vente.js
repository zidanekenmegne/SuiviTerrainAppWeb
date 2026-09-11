// ==========================================================
// POINTS DE VENTE - SuiviTerrain
// Version 1.0
// ==========================================================

document.addEventListener('DOMContentLoaded', function() {

    // ==========================================================
    // 1. MENU HAMBURGER (mobile)
    // ==========================================================
    var menuBtn = document.getElementById('menuHamburger');
    var mobileMenu = document.getElementById('mobileMenu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('open');
            var icon = menuBtn.querySelector('i');
            if (mobileMenu.classList.contains('open')) {
                icon.className = 'bi bi-x-lg';
            } else {
                icon.className = 'bi bi-list';
            }
        });
    }

    // ==========================================================
    // 2. DROPDOWN PROFIL (PC)
    // ==========================================================
    var userDropdown = document.getElementById('userDropdown');
    var dropdownMenu = document.getElementById('dropdownMenu');

    if (userDropdown && dropdownMenu) {
        userDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', function(e) {
            if (dropdownMenu.classList.contains('show') &&
                !dropdownMenu.contains(e.target) &&
                e.target !== userDropdown) {
                dropdownMenu.classList.remove('show');
            }
        });
    }

    // ==========================================================
    // 3. NOTIFICATIONS (PC + Mobile)
    // ==========================================================
    var notifBtnPC = document.getElementById('notifBtnPC');
    var notifBtnMobile = document.getElementById('notifBtnMobile');

    function redirigerNotifications() {
        window.location.href = 'notifications.html';
    }

    if (notifBtnPC) {
        notifBtnPC.addEventListener('click', redirigerNotifications);
    }
    if (notifBtnMobile) {
        notifBtnMobile.addEventListener('click', redirigerNotifications);
    }

    // ==========================================================
    // 4. BOUTON D'ACTION CONTEXTUEL (mobile) - ACTIF
    // ==========================================================
    var btnAction = document.getElementById('btnActionMobile');

    function updateActionButton() {
        if (!btnAction) return;

        var currentTab = getCurrentTab();
        var label = 'Action';
        var action = null;

        if (currentTab === 'tab-points') {
            label = 'Ajouter un point de vente';
            action = openAjouterPointModal;
        }
        if (currentTab === 'tab-categorie') {
            label = 'Ajouter une catégorie';
            action = openCategorieModal;
        };
            
        

        btnAction.style.opacity = '1';
        btnAction.style.cursor = 'pointer';
        btnAction.style.pointerEvents = 'auto';
        btnAction.setAttribute('aria-label', label);
        btnAction.title = label;

        btnAction.replaceWith(btnAction.cloneNode(true));
        var newBtn = document.getElementById('btnActionMobile');

        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (action) action();
        });
    }

    // ==========================================================
    // 5. DONNEES
    // ==========================================================
    var pointsData = [
        { id: 1, nom: 'Magasin A', categorie: 'Alimentation', contact: '+237 612 34 56 78',
            adresse: 'Centre-ville', latitude: 4.051056, longitude: 9.767869, photo: '' },
        { id: 2, nom: 'Client B', categorie: 'Services', contact: '+237 698 54 32 10',
            adresse: 'Bonamoussadi', latitude: 4.058300, longitude: 9.738600, photo: '' },
        { id: 3, nom: 'Magasin C', categorie: 'Vetement', contact: '+237 677 88 99 00',
            adresse: 'Akwa', latitude: 4.045600, longitude: 9.692300, photo: '' },
        { id: 4, nom: 'Client D', categorie: 'Alimentation', contact: '+237 699 12 34 56',
            adresse: 'Bepanda', latitude: 4.062100, longitude: 9.713500, photo: '' },
        { id: 5, nom: 'Magasin E', categorie: 'Electronique', contact: '+237 655 78 90 12',
            adresse: 'Total Logbaba', latitude: 4.040200, longitude: 9.727800, photo: '' },
        { id: 6, nom: 'Client F', categorie: 'Services', contact: '+237 688 45 67 89',
            adresse: 'Makape', latitude: 4.075400, longitude: 9.750100, photo: '' },
        { id: 7, nom: 'Magasin G', categorie: 'Alimentation', contact: '+237 622 33 44 55',
            adresse: 'Bonapriso', latitude: 4.068900, longitude: 9.771200, photo: '' },
        { id: 8, nom: 'Client H', categorie: 'Services', contact: '+237 677 11 22 33',
            adresse: 'Makepe', latitude: 4.083000, longitude: 9.729500, photo: '' },
        { id: 9, nom: 'Magasin I', categorie: 'Electronique', contact: '+237 699 88 77 66',
            adresse: 'Kotto', latitude: 4.052800, longitude: 9.688400, photo: '' },
        { id: 10, nom: 'Client J', categorie: 'Vetement', contact: '+237 655 44 33 22',
            adresse: 'Mbangue', latitude: 4.061700, longitude: 9.698900, photo: '' }
    ];

    var categoriesData = [
        { id: 1, nom: 'Alimentation', couleur: '#28a745' },
        { id: 2, nom: 'Services', couleur: '#007bff' },
        { id: 3, nom: 'Vetement', couleur: '#ffc107' },
        { id: 4, nom: 'Electronique', couleur: '#dc3545' }
    ];

    var nextPointId = 11;
    var nextCategorieId = 5;
    var currentDetailPointId = null;
    var isEditing = false;
    var categorieEditMode = false;
    var categorieEditId = null;

    // ==========================================================
    // 6. FONCTIONS
    // ==========================================================
    function getCategorieColorByName(nom) {
        var cat = categoriesData.find(function(c) { return c.nom === nom; });
        return cat ? cat.couleur : '#6c757d';
    }

    function getCurrentTab() {
        var activeTab = document.querySelector('.tab-btn.active');
        return activeTab ? activeTab.getAttribute('data-tab') : 'tab-points';
    }

    // ==========================================================
    // 7. RENDU : POINTS DE VENTE
    // ==========================================================
    function renderPoints() {
        var tbody = document.getElementById('pointsTableBody');
        var searchTerm = document.getElementById('searchPoint') ? document.getElementById('searchPoint').value.toLowerCase().trim() : '';

        var filtered = pointsData;
        if (searchTerm) {
            filtered = pointsData.filter(function(p) {
                return p.nom.toLowerCase().includes(searchTerm) ||
                    p.adresse.toLowerCase().includes(searchTerm) ||
                    p.categorie.toLowerCase().includes(searchTerm);
            });
        }

        if (filtered.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="5" style="text-align:center;padding:2rem 0;color:#6c757d;"><i class="bi bi-inbox" style="display:block;font-size:2rem;margin-bottom:0.5rem;"></i>Aucun point de vente trouve</td></tr>';
            return;
        }

        var html = '';
        filtered.forEach(function(p) {
            var color = getCategorieColorByName(p.categorie);
            html +=
                '<tr>' +
                '<td><strong>' + p.nom + '</strong></td>' +
                '<td><span class="categorie-pastille" style="background-color:' + color + ';"></span> ' + p.categorie +
                '</td>' +
                '<td class="col-contact">' + p.contact + '</td>' +
                '<td class="col-adresse">' + p.adresse + '</td>' +
                '<td style="text-align:center;"><button class="btn-detail" data-id="' + p.id + '">Detail</button></td>' +
                '</tr>';
        });

        tbody.innerHTML = html;

        document.querySelectorAll('.btn-detail').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = parseInt(this.dataset.id);
                openDetailModal(id);
            });
        });
    }

    // ==========================================================
    // 8. RENDU : CATEGORIES
    // ==========================================================
    function renderCategories() {
        var tbody = document.getElementById('categoriesTableBody');

        if (categoriesData.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="3" style="text-align:center;padding:2rem 0;color:#6c757d;"><i class="bi bi-tags" style="display:block;font-size:2rem;margin-bottom:0.5rem;"></i>Aucune categorie creee</td></tr>';
            return;
        }

        var html = '';
        categoriesData.forEach(function(c) {
            var count = pointsData.filter(function(p) { return p.categorie === c.nom; }).length;
            html +=
                '<tr>' +
                '<td><strong>' + c.nom + '</strong></td>' +
                '<td><span class="categorie-pastille" style="background-color:' + c.couleur + ';"></span></td>' +
                '<td>' + count + '</td>' +
                '</tr>';
        });

        tbody.innerHTML = html;
    }

    // ==========================================================
    // 9. MODALE DETAIL POINT - CORRIGÉE
    // ==========================================================
    function openDetailModal(id) {
        var point = pointsData.find(function(p) { return p.id === id; });
        if (!point) return;

        currentDetailPointId = id;
        isEditing = false;

        var photoEl = document.getElementById('detailPhoto');
        if (point.photo) {
            photoEl.src = point.photo;
        } else {
            photoEl.src = 'data:image/svg+xml,' + encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0ece6"/><text x="100" y="110" text-anchor="middle" font-family="sans-serif" font-size="40" fill="#6c757d">🏪</text></svg>'
            );
        }

        document.getElementById('detailModalTitle').textContent = 'Detail du point de vente';

        var container = document.getElementById('detailInfoContainer');
        var categoriesOptions = categoriesData.map(function(c) {
            return '<option value="' + c.nom + '" ' + (c.nom === point.categorie ? 'selected' : '') + '>' + c.nom +
                '</option>';
        }).join('');

        container.innerHTML =
            '<div class="info-row"><span class="info-label">Nom</span><span class="info-value"><input type="text" id="editNom" value="' +
            point.nom + '" disabled></span></div>' +
            '<div class="info-row"><span class="info-label">Categorie</span><span class="info-value"><select id="editCategorie" disabled>' +
            categoriesOptions + '</select></span></div>' +
            '<div class="info-row"><span class="info-label">Contact</span><span class="info-value"><input type="text" id="editContact" value="' +
            point.contact + '" disabled></span></div>' +
            '<div class="info-row"><span class="info-label">Adresse</span><span class="info-value"><input type="text" id="editAdresse" value="' +
            point.adresse + '" disabled></span></div>';

        var footer = document.getElementById('detailModalFooter');
        footer.innerHTML =
            '<button type="button" class="btn-retour" data-bs-dismiss="modal"><i class="bi bi-arrow-left" aria-hidden="true"></i> Retour</button>' +
            '<button type="button" class="btn-modifier" id="btnModifierPoint"><i class="bi bi-pencil" aria-hidden="true"></i> Modifier</button>' +
            '<button type="button" class="btn-danger" id="btnSupprimerPoint"><i class="bi bi-trash" aria-hidden="true"></i> Supprimer</button>';

        var modalElement = document.getElementById('detailPointModal');
        var modal = new bootstrap.Modal(modalElement);

        modalElement.addEventListener('shown.bs.modal', function() {
            this.removeAttribute('aria-hidden');
        });

        modal.show();

        document.getElementById('btnModifierPoint').addEventListener('click', function() {
            enableEditing(point);
        });

        document.getElementById('btnSupprimerPoint').addEventListener('click', function() {
            if (confirm(
                    'Voulez-vous vraiment supprimer ce point de vente ? Cette action est irreversible.'
                )) {
                var index = pointsData.indexOf(point);
                if (index !== -1) {
                    pointsData.splice(index, 1);
                    renderPoints();
                    renderCategories();
                    showToast('Point de vente supprime avec succes');
                    var modalInstance = bootstrap.Modal.getInstance(document.getElementById(
                        'detailPointModal'));
                    modalInstance.hide();
                }
            }
        });
    }

    function enableEditing(point) {
        if (isEditing) return;
        isEditing = true;

        document.getElementById('editNom').disabled = false;
        document.getElementById('editCategorie').disabled = false;
        document.getElementById('editContact').disabled = false;
        document.getElementById('editAdresse').disabled = false;

        var footer = document.getElementById('detailModalFooter');
        footer.innerHTML =
            '<button type="button" class="btn-annuler" id="btnAnnulerEdit"><i class="bi bi-x-circle" aria-hidden="true"></i> Annuler</button>' +
            '<button type="button" class="btn-enregistrer" id="btnEnregistrerEdit"><i class="bi bi-check-lg" aria-hidden="true"></i> Enregistrer</button>' +
            '<button type="button" class="btn-danger" id="btnSupprimerPoint"><i class="bi bi-trash" aria-hidden="true"></i> Supprimer</button>';

        document.getElementById('btnAnnulerEdit').addEventListener('click', function() {
            isEditing = false;
            var refreshed = pointsData.find(function(p) { return p.id === point.id; });
            if (refreshed) {
                document.getElementById('editNom').value = refreshed.nom;
                document.getElementById('editCategorie').value = refreshed.categorie;
                document.getElementById('editContact').value = refreshed.contact;
                document.getElementById('editAdresse').value = refreshed.adresse;
            }
            document.getElementById('editNom').disabled = true;
            document.getElementById('editCategorie').disabled = true;
            document.getElementById('editContact').disabled = true;
            document.getElementById('editAdresse').disabled = true;

            footer.innerHTML =
                '<button type="button" class="btn-retour" data-bs-dismiss="modal"><i class="bi bi-arrow-left" aria-hidden="true"></i> Retour</button>' +
                '<button type="button" class="btn-modifier" id="btnModifierPoint"><i class="bi bi-pencil" aria-hidden="true"></i> Modifier</button>' +
                '<button type="button" class="btn-danger" id="btnSupprimerPoint"><i class="bi bi-trash" aria-hidden="true"></i> Supprimer</button>';
            document.getElementById('btnModifierPoint').addEventListener('click', function() {
                enableEditing(refreshed);
            });
            document.getElementById('btnSupprimerPoint').addEventListener('click', function() {
                if (confirm(
                        'Voulez-vous vraiment supprimer ce point de vente ? Cette action est irreversible.'
                    )) {
                    var index = pointsData.indexOf(refreshed);
                    if (index !== -1) {
                        pointsData.splice(index, 1);
                        renderPoints();
                        renderCategories();
                        showToast('Point de vente supprime avec succes');
                        var modalInstance = bootstrap.Modal.getInstance(document.getElementById(
                            'detailPointModal'));
                        modalInstance.hide();
                    }
                }
            });
        });

        document.getElementById('btnEnregistrerEdit').addEventListener('click', function() {
            var nom = document.getElementById('editNom').value.trim();
            var categorie = document.getElementById('editCategorie').value;
            var contact = document.getElementById('editContact').value.trim();
            var adresse = document.getElementById('editAdresse').value.trim();

            if (!nom) {
                showToast('Le nom est obligatoire');
                return;
            }

            var pointToUpdate = pointsData.find(function(p) { return p.id === point.id; });
            if (pointToUpdate) {
                pointToUpdate.nom = nom;
                pointToUpdate.categorie = categorie;
                pointToUpdate.contact = contact || 'Non renseigne';
                pointToUpdate.adresse = adresse || 'Non renseigne';
            }

            showToast('Point de vente modifie avec succes');
            renderPoints();
            renderCategories();

            var modal = bootstrap.Modal.getInstance(document.getElementById('detailPointModal'));
            modal.hide();
        });

        document.getElementById('btnSupprimerPoint').addEventListener('click', function() {
            if (confirm(
                    'Voulez-vous vraiment supprimer ce point de vente ? Cette action est irreversible.'
                )) {
                var index = pointsData.indexOf(point);
                if (index !== -1) {
                    pointsData.splice(index, 1);
                    renderPoints();
                    renderCategories();
                    showToast('Point de vente supprime avec succes');
                    var modalInstance = bootstrap.Modal.getInstance(document.getElementById(
                        'detailPointModal'));
                    modalInstance.hide();
                }
            }
        });
    }

    // ==========================================================
    // 10. PHOTO
    // ==========================================================
    document.getElementById('photoBadge').addEventListener('click', function() {
        document.getElementById('photoInput').click();
    });

    document.getElementById('photoInput').addEventListener('change', function() {
        var file = this.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showToast('Veuillez selectionner une image');
                this.value = '';
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showToast('L\'image ne doit pas depasser 5 Mo');
                this.value = '';
                return;
            }

            var reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('detailPhoto').src = e.target.result;
                if (currentDetailPointId) {
                    var point = pointsData.find(function(p) { return p.id === currentDetailPointId; });
                    if (point) {
                        point.photo = e.target.result;
                    }
                }
                showToast('Photo mise a jour');
            };
            reader.readAsDataURL(file);
        }
    });

    // ==========================================================
    // 11. MODALE AJOUTER POINT - CORRIGÉE DÉFINITIVEMENT
    // ==========================================================
    function openAjouterPointModal() {
        // Fermer la modale catégorie si elle est ouverte
        try {
            var existingModal = bootstrap.Modal.getInstance(document.getElementById('categorieModal'));
            if (existingModal) {
                existingModal.hide();
            }
        } catch (e) {
            // Ignorer
        }

        // Réinitialiser les champs
        document.getElementById('ajoutNom').value = '';
        document.getElementById('ajoutCategorie').value = 'Alimentation';
        document.getElementById('ajoutContact').value = '';
        document.getElementById('ajoutAdresse').value = '';

        // Ouvrir la modale
        var modalElement = document.getElementById('ajouterPointModal');
        var modal = new bootstrap.Modal(modalElement);

        modalElement.addEventListener('shown.bs.modal', function() {
            this.removeAttribute('aria-hidden');
        });

        modal.show();
    }

    document.getElementById('btnAjouterPoint').addEventListener('click', openAjouterPointModal);

    document.getElementById('btnAjoutAnnuler').addEventListener('click', function() {
        var modal = bootstrap.Modal.getInstance(document.getElementById('ajouterPointModal'));
        if (modal) modal.hide();
    });

    document.getElementById('btnAjoutEnregistrer').addEventListener('click', function() {
        var nom = document.getElementById('ajoutNom').value.trim();
        var categorie = document.getElementById('ajoutCategorie').value;
        var contact = document.getElementById('ajoutContact').value.trim();
        var adresse = document.getElementById('ajoutAdresse').value.trim();

        if (!nom) {
            showToast('Le nom est obligatoire');
            return;
        }

        var newPoint = {
            id: nextPointId++,
            nom: nom,
            categorie: categorie,
            contact: contact || 'Non renseigne',
            adresse: adresse || 'Non renseigne',
            latitude: 4.051056,
            longitude: 9.767869,
            photo: ''
        };

        pointsData.push(newPoint);
        renderPoints();
        renderCategories();
        showToast('Point de vente ajoute avec succes');

        var modal = bootstrap.Modal.getInstance(document.getElementById('ajouterPointModal'));
        modal.hide();
    });

    // ==========================================================
    // 12. CATEGORIES - OUVERTURE MODALE - CORRIGÉE DÉFINITIVEMENT
    // ==========================================================
    function openCategorieModal(id) {
        // Fermer la modale ajouter point si elle est ouverte
        try {
            var existingModal = bootstrap.Modal.getInstance(document.getElementById('ajouterPointModal'));
            if (existingModal) {
                existingModal.hide();
            }
        } catch (e) {
            // Ignorer
        }

        if (id) {
            var cat = categoriesData.find(function(c) { return c.id === id; });
            if (!cat) return;
            categorieEditMode = true;
            categorieEditId = id;
            document.getElementById('categorieModalLabel').textContent = 'Modifier la categorie';
            document.getElementById('categorieNom').value = cat.nom;
            document.getElementById('categorieCouleur').value = cat.couleur;
            document.getElementById('categorieEditId').value = id;
        } else {
            categorieEditMode = false;
            categorieEditId = null;
            document.getElementById('categorieModalLabel').textContent = 'Ajouter une categorie';
            document.getElementById('categorieNom').value = '';
            document.getElementById('categorieCouleur').value = '#28a745';
            document.getElementById('categorieEditId').value = '';
        }

        var modalElement = document.getElementById('categorieModal');
        var modal = new bootstrap.Modal(modalElement);

        modalElement.addEventListener('shown.bs.modal', function() {
            this.removeAttribute('aria-hidden');
        });

        modal.show();
    }

    // ==========================================================
    // 13. CATEGORIES - SAUVEGARDE
    // ==========================================================
    document.getElementById('categorieSaveBtn').addEventListener('click', function() {
        var nom = document.getElementById('categorieNom').value.trim();
        var couleur = document.getElementById('categorieCouleur').value;

        if (!nom) {
            showToast('Le nom de la categorie est obligatoire');
            return;
        }

        if (categorieEditMode && categorieEditId) {
            var cat = categoriesData.find(function(c) { return c.id === categorieEditId; });
            if (cat) {
                var oldNom = cat.nom;
                cat.nom = nom;
                cat.couleur = couleur;
                pointsData.forEach(function(p) {
                    if (p.categorie === oldNom) {
                        p.categorie = nom;
                    }
                });
                showToast('Categorie modifiee avec succes');
            }
        } else {
            if (categoriesData.some(function(c) { return c.nom === nom; })) {
                showToast('Cette categorie existe deja');
                return;
            }
            categoriesData.push({
                id: nextCategorieId++,
                nom: nom,
                couleur: couleur
            });
            showToast('Categorie ajoutee avec succes');
        }

        var modal = bootstrap.Modal.getInstance(document.getElementById('categorieModal'));
        modal.hide();
        renderPoints();
        renderCategories();
    });

    // ==========================================================
    // 14. RECHERCHE
    // ==========================================================
    var searchInput = document.getElementById('searchPoint');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            renderPoints();
        });
    }

    // ==========================================================
    // 15. ONGLETS
    // ==========================================================
    var tabPointsBtn = document.getElementById('tabPointsBtn');
    var tabCategoriesBtn = document.getElementById('tabCategoriesBtn');
    var tabPoints = document.getElementById('tab-points');
    var tabCategories = document.getElementById('tab-categories');

    tabPointsBtn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
        document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
        this.classList.add('active');
        tabPoints.classList.add('active');
        updateActionButton();
    });

    tabCategoriesBtn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
        document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
        this.classList.add('active');
        tabCategories.classList.add('active');
        renderCategories();
        updateActionButton();
    });

    // ==========================================================
    // 16. RECHERCHE GLOBALE
    // ==========================================================
    var searchInputGlobal = document.getElementById('globalSearchInput');
    var suggestionsContainer = document.getElementById('globalSearchSuggestions');

    if (searchInputGlobal && suggestionsContainer) {
        var searchData = {
            visites: [
                { id: 1, titre: 'Visite commerciale - Magasin A', adresse: 'Centre-ville',
                    date: '12 juin 2025', statut: 'Realisee' },
                { id: 2, titre: 'Collecte de commandes - Client B', adresse: 'Bonamoussadi',
                    date: '12 juin 2025', statut: 'En attente' },
            ],
            pointsVente: [
                { id: 1, nom: 'Magasin A', adresse: 'Centre-ville', categorie: 'Alimentation' },
                { id: 2, nom: 'Client B', adresse: 'Bonamoussadi', categorie: 'Services' },
            ],
            utilisateurs: [
                { id: 1, nom: 'Zidane Fredy', email: 'zidane@suiviterrain.com', role: 'Administrateur' },
                { id: 2, nom: 'Sarah Niong', email: 'sarah@suiviterrain.com', role: 'Agent' },
            ],
            planning: [
                { id: 1, date: '12 juin 2025', agent: 'Zidane', visites: 3 },
            ]
        };

        function performSearch(query) {
            var term = query.toLowerCase().trim();
            var results = [];
            if (!term || term.length < 2) return results;

            searchData.visites.forEach(function(v) {
                if (v.titre.toLowerCase().includes(term) || v.adresse.toLowerCase().includes(term)) {
                    results.push({
                        type: 'visit',
                        label: v.titre,
                        subtitle: v.adresse + ' • ' + v.date,
                        badge: v.statut,
                        url: 'detail-visite.html?id=' + v.id,
                        icon: 'bi bi-calendar-event'
                    });
                }
            });

            searchData.pointsVente.forEach(function(p) {
                if (p.nom.toLowerCase().includes(term) || p.adresse.toLowerCase().includes(term)) {
                    results.push({
                        type: 'point',
                        label: p.nom,
                        subtitle: p.adresse + ' • ' + p.categorie,
                        badge: p.categorie,
                        url: 'points-vente.html',
                        icon: 'bi bi-shop'
                    });
                }
            });

            searchData.utilisateurs.forEach(function(u) {
                if (u.nom.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)) {
                    results.push({
                        type: 'user',
                        label: u.nom,
                        subtitle: u.email + ' • ' + u.role,
                        badge: u.role,
                        url: 'gestion-utilisateurs.html',
                        icon: 'bi bi-person'
                    });
                }
            });

            searchData.planning.forEach(function(p) {
                if (p.date.toLowerCase().includes(term) || p.agent.toLowerCase().includes(term)) {
                    results.push({
                        type: 'planning',
                        label: 'Planning du ' + p.date,
                        subtitle: p.agent + ' • ' + p.visites + ' visites',
                        badge: p.visites + ' visites',
                        url: 'planning-visites.html?date=' + p.date,
                        icon: 'bi bi-calendar-check'
                    });
                }
            });

            return results;
        }

        function renderSuggestions(results) {
            var badges = { visit: 'visit', point: 'point', user: 'user', planning: 'planning' };
            var icons = { visit: 'visit', point: 'point', user: 'user', planning: 'planning' };
            var labels = { visit: 'Visites', point: 'Points de vente', user: 'Utilisateurs',
                planning: 'Planning' };

            if (results.length === 0) {
                suggestionsContainer.innerHTML =
                    '<div class="suggestion-empty"><i class="bi bi-search" aria-hidden="true"></i>Aucun resultat trouve</div>';
                suggestionsContainer.classList.add('visible');
                return;
            }

            var grouped = { visit: [], point: [], user: [], planning: [] };
            results.forEach(function(r) { if (grouped[r.type]) grouped[r.type].push(r); });

            var html = '';
            for (var type in grouped) {
                var items = grouped[type];
                if (items.length === 0) continue;
                html += '<div class="suggestion-group-title">' + labels[type] + '</div>';
                items.forEach(function(item) {
                    html +=
                        '<div class="suggestion-item" data-url="' + item.url + '">' +
                        '<div class="suggestion-icon ' + icons[item.type] + '">' +
                        '<i class="' + item.icon + '" aria-hidden="true"></i>' +
                        '</div>' +
                        '<div class="suggestion-info">' +
                        '<div class="suggestion-title">' + item.label + '</div>' +
                        '<div class="suggestion-subtitle">' + item.subtitle + '</div>' +
                        '</div>' +
                        '<span class="suggestion-badge ' + badges[item.type] + '">' + item.badge +
                        '</span>' +
                        '</div>';
                });
            }

            suggestionsContainer.innerHTML = html;
            suggestionsContainer.classList.add('visible');

            suggestionsContainer.querySelectorAll('.suggestion-item').forEach(function(el) {
                el.addEventListener('click', function() {
                    var url = this.dataset.url;
                    if (url) window.location.href = url;
                });
            });
        }

        var searchTimeout;
        searchInputGlobal.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            var query = this.value;
            if (query.length < 2) {
                suggestionsContainer.classList.remove('visible');
                return;
            }
            searchTimeout = setTimeout(function() {
                var results = performSearch(query);
                renderSuggestions(results);
            }, 250);
        });

        document.addEventListener('click', function(e) {
            var container = document.getElementById('globalSearchContainer');
            if (container && !container.contains(e.target)) {
                suggestionsContainer.classList.remove('visible');
            }
        });

        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputGlobal.focus();
                searchInputGlobal.select();
            }
            if (e.key === 'Escape') {
                suggestionsContainer.classList.remove('visible');
                searchInputGlobal.blur();
            }
        });

        var selectedIndex = -1;
        searchInputGlobal.addEventListener('keydown', function(e) {
            var items = suggestionsContainer.querySelectorAll('.suggestion-item');
            if (items.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = (selectedIndex + 1) % items.length;
                items.forEach(function(el, i) { el.style.background = i === selectedIndex ? '#FFF8F0' : ''; });
                if (selectedIndex >= 0) items[selectedIndex].scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                items.forEach(function(el, i) { el.style.background = i === selectedIndex ? '#FFF8F0' : ''; });
                if (selectedIndex >= 0) items[selectedIndex].scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < items.length) {
                    var url = items[selectedIndex].dataset.url;
                    if (url) window.location.href = url;
                }
            }
        });
    }

    // ==========================================================
    // 17. TOAST
    // ==========================================================
    function showToast(message) {
        var toast = document.createElement('div');
        toast.style.cssText =
            'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#ffffff;padding:0.75rem 1.5rem;border-radius:12px;font-family:Segoe UI,sans-serif;font-size:0.85rem;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,0.2);z-index:9999;opacity:0;transition:opacity 0.3s ease;max-width:90%;text-align:center;';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(function() { toast.style.opacity = '1'; }, 50);
        setTimeout(function() {
            toast.style.opacity = '0';
            setTimeout(function() { toast.remove(); }, 300);
        }, 2500);
    }

    // ==========================================================
    // 18. INITIALISATION
    // ==========================================================
    renderPoints();
    renderCategories();
    updateActionButton();

    console.log('Page Points de vente chargee');
    console.log(pointsData.length + ' points de vente');
    console.log(categoriesData.length + ' categories');
});