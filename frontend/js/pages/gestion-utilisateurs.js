// ==========================================================
// GESTION DES UTILISATEURS - SuiviTerrain
// ==========================================================

document.addEventListener('DOMContentLoaded', function() {

    // ==========================================================
    // RETOUR (mobile)
    // ==========================================================
    var backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.history.back();
        });
    }

    // ==========================================================
    // NOTIFICATIONS (PC + Mobile)
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
    // DONNEES FACTICES DES UTILISATEURS
    // ==========================================================
    var users = [
        { id: 1, nom: 'Zidane Fredy', email: 'zidane@suiviterrain.com', telephone: '+237 652 14 45 56', role: 'admin',
            zone: 'Douala', actif: true },
        { id: 2, nom: 'Sarah Niong', email: 'sarah@suiviterrain.com', telephone: '+237 698 54 32 10', role: 'agent',
            zone: 'Yaounde', actif: true },
        { id: 3, nom: 'Jean Dupont', email: 'jean@suiviterrain.com', telephone: '+237 677 88 99 00', role: 'agent',
            zone: 'Douala', actif: false },
        { id: 4, nom: 'Marie Claire', email: 'marie@suiviterrain.com', telephone: '+237 699 12 34 56', role: 'admin',
            zone: 'Bafoussam', actif: true },
        { id: 5, nom: 'Paul Ngassa', email: 'paul@suiviterrain.com', telephone: '+237 655 78 90 12', role: 'agent',
            zone: 'Douala', actif: true }
    ];
    var nextId = 6;

    // ==========================================================
    // RECHERCHE
    // ==========================================================
    var searchInput = document.getElementById('searchUser');

    function renderTable(filteredUsers) {
        var tbody = document.getElementById('userTableBody');
        var searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

        var data = filteredUsers || users;

        if (searchTerm) {
            data = data.filter(function(u) {
                return u.nom.toLowerCase().includes(searchTerm) ||
                       u.email.toLowerCase().includes(searchTerm);
            });
        }

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem 0; color: #6c757d; font-size: 0.9rem;">' +
                '<i class="bi bi-inbox" aria-hidden="true" style="display: block; font-size: 2rem; margin-bottom: 0.5rem;"></i>' +
                'Aucun utilisateur trouve</td></tr>';
            return;
        }

        var html = '';
        data.forEach(function(u) {
            var statutLabel = u.actif ? 'Actif' : 'Inactif';
            var statutClass = u.actif ? 'actif' : 'inactif';
            var roleLabel = u.role === 'admin' ? 'Administrateur' : 'Agent';
            var roleClass = u.role === 'admin' ? 'admin' : 'agent';

            html += '<tr data-id="' + u.id + '">' +
                '<td><strong>' + u.nom + '</strong></td>' +
                '<td>' + u.email + '</td>' +
                '<td><span class="badge-role ' + roleClass + '">' + roleLabel + '</span></td>' +
                '<td><span class="badge-status ' + statutClass + '">' + statutLabel + '</span></td>' +
                '<td style="text-align: center;">' +
                '<div class="actions-dropdown dropdown">' +
                '<button class="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">' +
                '<i class="bi bi-three-dots-vertical" aria-hidden="true"></i>' +
                '</button>' +
                '<ul class="dropdown-menu dropdown-menu-end">' +
                '<li><button class="dropdown-item action-role" data-id="' + u.id + '"><i class="bi bi-shield-check" aria-hidden="true"></i> Modifier le role</button></li>' +
                '<li><button class="dropdown-item action-status" data-id="' + u.id + '"><i class="bi ' + (u.actif ? 'bi-pause-circle' : 'bi-play-circle') + '" aria-hidden="true"></i> ' + (u.actif ? 'Desactiver' : 'Activer') + '</button></li>' +
                '<li><hr class="dropdown-divider"></li>' +
                '<li><button class="dropdown-item text-danger action-delete" data-id="' + u.id + '"><i class="bi bi-trash" aria-hidden="true"></i> Supprimer</button></li>' +
                '</ul></div></td></tr>';
        });

        tbody.innerHTML = html;

        // Reinitialiser les evenements Bootstrap Dropdown
        document.querySelectorAll('.actions-dropdown .dropdown-toggle').forEach(function(btn) {
            new bootstrap.Dropdown(btn);
        });

        // ACTIONS DES MENUS DEROULANTS
        // Modifier le role
        document.querySelectorAll('.action-role').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = parseInt(this.dataset.id);
                var user = users.find(function(u) { return u.id === id; });
                if (user) {
                    var newRole = user.role === 'admin' ? 'agent' : 'admin';
                    if (confirm('Passer ' + user.nom + ' en ' + (newRole === 'admin' ? 'Administrateur' : 'Agent') + ' ?')) {
                        user.role = newRole;
                        renderTable();
                        showToast('' + user.nom + ' est maintenant ' + (newRole === 'admin' ? 'Administrateur' : 'Agent'));
                    }
                }
            });
        });

        // Activer/Desactiver
        document.querySelectorAll('.action-status').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = parseInt(this.dataset.id);
                var user = users.find(function(u) { return u.id === id; });
                if (user) {
                    var newStatus = !user.actif;
                    var action = newStatus ? 'activer' : 'desactiver';
                    if (confirm('Voulez-vous ' + action + ' ' + user.nom + ' ?')) {
                        user.actif = newStatus;
                        renderTable();
                        showToast('' + user.nom + ' ' + (newStatus ? 'active' : 'desactive'));
                    }
                }
            });
        });

        // Supprimer
        document.querySelectorAll('.action-delete').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = parseInt(this.dataset.id);
                var user = users.find(function(u) { return u.id === id; });
                if (user) {
                    if (confirm('Voulez-vous vraiment supprimer ' + user.nom + ' ? Cette action est irreversible.')) {
                        users = users.filter(function(u) { return u.id !== id; });
                        renderTable();
                        showToast('' + user.nom + ' a ete supprime');
                    }
                }
            });
        });
    }

    // ==========================================================
    // FILTRE DE RECHERCHE EN TEMPS REEL
    // ==========================================================
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            renderTable();
        });
    }

    // ==========================================================
    // TRI DES COLONNES
    // ==========================================================
    var sortColumn = 'nom';
    var sortAsc = true;

    document.querySelectorAll('#userTable thead th[data-sort]').forEach(function(th) {
        th.addEventListener('click', function() {
            var column = this.dataset.sort;
            if (sortColumn === column) {
                sortAsc = !sortAsc;
            } else {
                sortColumn = column;
                sortAsc = true;
            }

            users.sort(function(a, b) {
                var valA = a[column];
                var valB = b[column];
                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();
                if (valA < valB) return sortAsc ? -1 : 1;
                if (valA > valB) return sortAsc ? 1 : -1;
                return 0;
            });

            // Mettre a jour les icones
            document.querySelectorAll('#userTable thead th i').forEach(function(icon) {
                icon.className = 'bi bi-arrow-up';
            });
            var icon = th.querySelector('i');
            if (icon) {
                icon.className = sortAsc ? 'bi bi-arrow-up' : 'bi bi-arrow-down';
            }

            renderTable();
        });
    });

    // ==========================================================
    // ONGLETS
    // ==========================================================
    var tabListeBtn = document.getElementById('tabListeBtn');
    var tabAjoutBtn = document.getElementById('tabAjoutBtn');
    var tabListe = document.getElementById('tab-liste');
    var tabAjout = document.getElementById('tab-ajout');

    function switchTab(tabName) {
        document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
        document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });

        if (tabName === 'liste') {
            tabListe.classList.add('active');
            tabListeBtn.classList.add('active');
        } else {
            tabAjout.classList.add('active');
            tabAjoutBtn.classList.add('active');
        }
    }

    tabListeBtn.addEventListener('click', function() { switchTab('liste'); });
    tabAjoutBtn.addEventListener('click', function() { switchTab('ajout'); });

    // ==========================================================
    // FORMULAIRE D'AJOUT
    // ==========================================================
    var addForm = document.getElementById('addUserForm');

    addForm.addEventListener('submit', function(e) {
        e.preventDefault();

        var nom = document.getElementById('nomComplet').value.trim();
        var email = document.getElementById('emailUser').value.trim();
        var telephone = document.getElementById('telephoneUser').value.trim();
        var role = document.getElementById('roleUser').value;
        var zone = document.getElementById('zoneUser').value.trim();

        if (!nom || !email) {
            alert('Veuillez remplir au moins le nom et l\'email.');
            return;
        }

        var newUser = {
            id: nextId++,
            nom: nom,
            email: email,
            telephone: telephone || 'Non renseigne',
            role: role,
            zone: zone || 'Non renseigne',
            actif: true
        };

        users.push(newUser);
        renderTable();

        addForm.reset();

        showToast('' + nom + ' a ete ajoute avec succes');

        switchTab('liste');
    });

    // Annuler
    document.getElementById('btnCancelAdd').addEventListener('click', function() {
        addForm.reset();
        switchTab('liste');
    });

    // ==========================================================
    // TOAST
    // ==========================================================
    function showToast(message) {
        var toast = document.createElement('div');
        toast.style.cssText =
            'position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: #1a1a1a; color: #ffffff; padding: 0.75rem 1.5rem; border-radius: 12px; font-family: Segoe UI, sans-serif; font-size: 0.85rem; font-weight: 600; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 9999; opacity: 0; transition: opacity 0.3s ease; max-width: 90%; text-align: center;';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(function() { toast.style.opacity = '1'; }, 50);
        setTimeout(function() {
            toast.style.opacity = '0';
            setTimeout(function() { toast.remove(); }, 300);
        }, 3000);
    }

    // ==========================================================
    // INITIALISATION
    // ==========================================================
    renderTable();

    console.log('Page Gestion des utilisateurs chargee');
    console.log('' + users.length + ' utilisateurs charges');
});