/**
 * Profil - Logique de la page
 * Version 1.0
 */

document.addEventListener('DOMContentLoaded', function() {

    // ==========================================================
    // 1. BOUTON "+" MOBILE
    // ==========================================================
    var btnPlus = document.getElementById('btnPlusMobile');
    if (btnPlus) {
        btnPlus.style.opacity = '0.5';
        btnPlus.style.cursor = 'default';
        btnPlus.style.pointerEvents = 'none';
        btnPlus.setAttribute('aria-label', 'Aucune action disponible');
        btnPlus.title = 'Aucune action disponible';
        btnPlus.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('Aucune action disponible sur cette page');
        });
    }

    // ==========================================================
    // 2. NOTIFICATIONS (Mobile)
    // ==========================================================
    var notifBtnMobile = document.getElementById('notifBtnMobile');
    if (notifBtnMobile) {
        notifBtnMobile.addEventListener('click', function() {
            window.location.href = 'notifications.html';
        });
    }

    // ==========================================================
    // 3. UPLOAD DE PHOTO DE PROFIL
    // ==========================================================
    var avatarWrapper = document.getElementById('avatarWrapper');
    var avatarBadge = document.getElementById('avatarBadge');
    var avatarInput = document.getElementById('avatarInput');
    var avatarDisplay = document.getElementById('avatarDisplay');

    if (avatarWrapper) {
        avatarWrapper.addEventListener('click', function(e) {
            e.stopPropagation();
            avatarInput.click();
        });
    }

    if (avatarBadge) {
        avatarBadge.addEventListener('click', function(e) {
            e.stopPropagation();
            avatarInput.click();
        });
    }

    if (avatarInput) {
        avatarInput.addEventListener('change', function() {
            var file = this.files[0];
            if (file) {
                if (!file.type.startsWith('image/')) {
                    showToast('Veuillez selectionner une image (PNG, JPEG, GIF, WEBP).');
                    this.value = '';
                    return;
                }
                if (file.size > 5 * 1024 * 1024) {
                    showToast('L\'image ne doit pas depasser 5 Mo.');
                    this.value = '';
                    return;
                }
                var reader = new FileReader();
                reader.onload = function(e) {
                    avatarDisplay.innerHTML = '';
                    var img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = 'Photo de profil';
                    avatarDisplay.appendChild(img);
                    showToast('Photo de profil mise a jour');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // ==========================================================
    // 4. MODIFIER LE PROFIL
    // ==========================================================
    var btnEditProfil = document.getElementById('btnEditProfil');
    if (btnEditProfil) {
        btnEditProfil.addEventListener('click', function() {
            openEditProfilModal();
        });
    }

    function openEditProfilModal() {
        document.getElementById('editProfilNom').value = 'Zidane Fredy';
        document.getElementById('editProfilEmail').value = 'zidane@suiviterrain.com';
        document.getElementById('editProfilTelephone').value = '+237 652 14 45 56';
        document.getElementById('editProfilZone').value = 'Douala, Cameroun';

        var photoImg = document.getElementById('editProfilPhoto');
        var avatarImg = document.querySelector('.avatar img');
        if (avatarImg) {
            photoImg.src = avatarImg.src;
        }

        var modal = new bootstrap.Modal(document.getElementById('modifierProfilModal'));
        modal.show();
    }

    // Photo de profil dans la modale
    var editProfilPhotoBadge = document.getElementById('editProfilPhotoBadge');
    var editProfilPhotoInput = document.getElementById('editProfilPhotoInput');

    if (editProfilPhotoBadge) {
        editProfilPhotoBadge.addEventListener('click', function() {
            editProfilPhotoInput.click();
        });
    }

    if (editProfilPhotoInput) {
        editProfilPhotoInput.addEventListener('change', function() {
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
                    document.getElementById('editProfilPhoto').src = e.target.result;
                    showToast('Photo mise a jour');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Enregistrer les modifications du profil
    var saveProfilBtn = document.getElementById('saveProfilBtn');
    if (saveProfilBtn) {
        saveProfilBtn.addEventListener('click', function() {
            var nom = document.getElementById('editProfilNom').value.trim();
            var email = document.getElementById('editProfilEmail').value.trim();

            if (!nom || !email) {
                showToast('Le nom et l\'email sont obligatoires');
                return;
            }

            var nameEl = document.querySelector('.profile-name');
            if (nameEl) {
                nameEl.textContent = nom;
            }

            var infoValues = document.querySelectorAll('.info-value');
            if (infoValues.length > 0) {
                infoValues[0].textContent = nom;
                infoValues[1].textContent = email;
                infoValues[2].textContent = document.getElementById('editProfilTelephone').value.trim() || '+237 652 14 45 56';
                infoValues[3].textContent = 'Administrateur';
                infoValues[4].textContent = document.getElementById('editProfilZone').value.trim() || 'Douala, Cameroun';
            }

            // Mettre a jour la photo
            var photoSrc = document.getElementById('editProfilPhoto').src;
            if (photoSrc) {
                var avatarImg = document.querySelector('.avatar img');
                if (avatarImg) {
                    avatarImg.src = photoSrc;
                }
            }

            showToast('Profil modifie avec succes');
            var modal = bootstrap.Modal.getInstance(document.getElementById('modifierProfilModal'));
            if (modal) modal.hide();
        });
    }

    // ==========================================================
    // 5. CHANGER LE MOT DE PASSE
    // ==========================================================
    var btnChangePassword = document.getElementById('btnChangePassword');
    if (btnChangePassword) {
        btnChangePassword.addEventListener('click', function() {
            openPasswordModal();
        });
    }

    function openPasswordModal() {
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        document.getElementById('newPassword').disabled = true;
        document.getElementById('confirmPassword').disabled = true;
        document.getElementById('toggleNewPwd').disabled = true;
        document.getElementById('toggleConfirmPwd').disabled = true;
        document.getElementById('savePasswordBtn').disabled = true;
        document.getElementById('savePasswordBtn').style.opacity = '0.5';
        document.getElementById('savePasswordBtn').style.cursor = 'not-allowed';
        document.getElementById('currentPwdError').style.display = 'none';
        document.getElementById('confirmPwdError').style.display = 'none';

        var modal = new bootstrap.Modal(document.getElementById('changerMotPasseModal'));
        modal.show();
    }

    // Toggle mot de passe actuel
    var toggleCurrentPwd = document.getElementById('toggleCurrentPwd');
    if (toggleCurrentPwd) {
        toggleCurrentPwd.addEventListener('click', function() {
            var input = document.getElementById('currentPassword');
            var icon = document.getElementById('currentPwdIcon');
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'bi bi-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'bi bi-eye';
            }
        });
    }

    // Verification du mot de passe actuel
    var currentPassword = document.getElementById('currentPassword');
    if (currentPassword) {
        currentPassword.addEventListener('input', function() {
            var currentPwd = this.value;
            var errorEl = document.getElementById('currentPwdError');
            var newPwd = document.getElementById('newPassword');
            var confirmPwd = document.getElementById('confirmPassword');
            var toggleNew = document.getElementById('toggleNewPwd');
            var toggleConfirm = document.getElementById('toggleConfirmPwd');
            var saveBtn = document.getElementById('savePasswordBtn');

            if (currentPwd === 'admin123') {
                errorEl.style.display = 'none';
                newPwd.disabled = false;
                confirmPwd.disabled = false;
                toggleNew.disabled = false;
                toggleConfirm.disabled = false;
                newPwd.style.backgroundColor = '#ffffff';
                confirmPwd.style.backgroundColor = '#ffffff';
                toggleNew.style.backgroundColor = '#ffffff';
                toggleConfirm.style.backgroundColor = '#ffffff';
                checkPasswordMatch();
            } else if (currentPwd.length > 0) {
                errorEl.style.display = 'block';
                newPwd.disabled = true;
                confirmPwd.disabled = true;
                toggleNew.disabled = true;
                toggleConfirm.disabled = true;
                newPwd.style.backgroundColor = '#f8f5f0';
                confirmPwd.style.backgroundColor = '#f8f5f0';
                toggleNew.style.backgroundColor = '#f8f5f0';
                toggleConfirm.style.backgroundColor = '#f8f5f0';
                saveBtn.disabled = true;
                saveBtn.style.opacity = '0.5';
                saveBtn.style.cursor = 'not-allowed';
            } else {
                errorEl.style.display = 'none';
                newPwd.disabled = true;
                confirmPwd.disabled = true;
                toggleNew.disabled = true;
                toggleConfirm.disabled = true;
                newPwd.style.backgroundColor = '#f8f5f0';
                confirmPwd.style.backgroundColor = '#f8f5f0';
                toggleNew.style.backgroundColor = '#f8f5f0';
                toggleConfirm.style.backgroundColor = '#f8f5f0';
                saveBtn.disabled = true;
                saveBtn.style.opacity = '0.5';
                saveBtn.style.cursor = 'not-allowed';
            }
        });
    }

    // Toggle nouveau mot de passe
    var toggleNewPwd = document.getElementById('toggleNewPwd');
    if (toggleNewPwd) {
        toggleNewPwd.addEventListener('click', function() {
            var input = document.getElementById('newPassword');
            var icon = document.getElementById('newPwdIcon');
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'bi bi-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'bi bi-eye';
            }
        });
    }

    // Toggle confirmation
    var toggleConfirmPwd = document.getElementById('toggleConfirmPwd');
    if (toggleConfirmPwd) {
        toggleConfirmPwd.addEventListener('click', function() {
            var input = document.getElementById('confirmPassword');
            var icon = document.getElementById('confirmPwdIcon');
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'bi bi-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'bi bi-eye';
            }
        });
    }

    // Verification de la correspondance des mots de passe
    function checkPasswordMatch() {
        var newPwd = document.getElementById('newPassword').value;
        var confirmPwd = document.getElementById('confirmPassword').value;
        var errorEl = document.getElementById('confirmPwdError');
        var saveBtn = document.getElementById('savePasswordBtn');

        if (newPwd.length > 0 && confirmPwd.length > 0) {
            if (newPwd === confirmPwd) {
                errorEl.style.display = 'none';
                saveBtn.disabled = false;
                saveBtn.style.opacity = '1';
                saveBtn.style.cursor = 'pointer';
            } else {
                errorEl.style.display = 'block';
                saveBtn.disabled = true;
                saveBtn.style.opacity = '0.5';
                saveBtn.style.cursor = 'not-allowed';
            }
        } else {
            errorEl.style.display = 'none';
            saveBtn.disabled = true;
            saveBtn.style.opacity = '0.5';
            saveBtn.style.cursor = 'not-allowed';
        }
    }

    var newPassword = document.getElementById('newPassword');
    if (newPassword) {
        newPassword.addEventListener('input', checkPasswordMatch);
    }

    var confirmPassword = document.getElementById('confirmPassword');
    if (confirmPassword) {
        confirmPassword.addEventListener('input', checkPasswordMatch);
    }

    // Enregistrer le nouveau mot de passe
    var savePasswordBtn = document.getElementById('savePasswordBtn');
    if (savePasswordBtn) {
        savePasswordBtn.addEventListener('click', function() {
            if (this.disabled) return;
            showToast('Mot de passe modifie avec succes');
            var modal = bootstrap.Modal.getInstance(document.getElementById('changerMotPasseModal'));
            if (modal) modal.hide();
        });
    }

    // ==========================================================
    // 6. DECONNEXION
    // ==========================================================
    var btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function() {
            if (confirm('Etes-vous sur de vouloir vous deconnecter ?')) {
                window.location.href = 'connexion.html';
            }
        });
    }

    // ==========================================================
    // 7. TOAST
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
    // 8. RECHERCHE GENERALE (placeholder)
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

    console.log('Page Profil chargee');
});

// ==========================================================
// MENU HAMBURGER (mobile)
// ==========================================================
var menuBtn = document.getElementById('menuHamburger');
var mobileMenu = document.getElementById('mobileMenu');

if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function() {
        // 1. Ajoute ou retire la classe "open" sur le menu déroulant
        mobileMenu.classList.toggle('open');

        // 2. Change l'icône (hamburger ↔ croix)
        var icon = menuBtn.querySelector('i');
        if (mobileMenu.classList.contains('open')) {
            icon.className = 'bi bi-x-lg';   // Croix
        } else {
            icon.className = 'bi bi-list';   // Hamburger
        }
    });
}