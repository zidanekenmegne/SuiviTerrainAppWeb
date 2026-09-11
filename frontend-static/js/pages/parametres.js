// ==========================================================
// PARAMETRES - SuiviTerrain
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
    // 4. BOUTON D'ACTION CONTEXTUEL (mobile) - GRISE
    // ==========================================================
    var btnAction = document.getElementById('btnActionMobile');

    function updateActionButton() {
        // Page Parametres : AUCUNE ACTION D'AJOUT
        btnAction.style.opacity = '0.4';
        btnAction.style.cursor = 'not-allowed';
        btnAction.style.pointerEvents = 'none';
        btnAction.setAttribute('aria-label', 'Aucune action disponible sur cette page');

        // Supprimer les anciens ecouteurs
        btnAction.replaceWith(btnAction.cloneNode(true));
        var newBtn = document.getElementById('btnActionMobile');

        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('Aucune action disponible sur cette page');
        });
    }

    // ==========================================================
    // 5. TOAST
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
    // 6. DECONNEXION
    // ==========================================================
    window.handleLogout = function() {
        if (confirm('Etes-vous sur de vouloir vous deconnecter ?')) {
            window.location.href = 'connexion.html';
        }
    };

    // ==========================================================
    // 7. TOGGLES
    // ==========================================================
    var notifToggle = document.getElementById('notifToggle');
    var offlineToggle = document.getElementById('offlineToggle');

    if (notifToggle) {
        notifToggle.addEventListener('change', function() {
            var status = this.checked ? 'activees' : 'desactivees';
            showToast('Notifications ' + status);
        });
    }

    if (offlineToggle) {
        offlineToggle.addEventListener('change', function() {
            var status = this.checked ? 'active' : 'desactive';
            showToast('Mode hors ligne ' + status);
        });
    }

    // ==========================================================
    // 8. CHANGER LE MOT DE PASSE
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
            modal.hide();
        });
    }

    // ==========================================================
    // 9. RECHERCHE GLOBALE
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
    // 10. INITIALISATION
    // ==========================================================
    updateActionButton();

    console.log('Page Parametres chargee');
});