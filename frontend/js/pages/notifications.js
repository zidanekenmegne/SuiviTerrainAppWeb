// ==========================================================
// NOTIFICATIONS - SuiviTerrain
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
            var isOpen = dropdownMenu.classList.contains('show');
            dropdownMenu.classList.toggle('show');
        });

        // Fermer le dropdown quand on clique ailleurs
        document.addEventListener('click', function(e) {
            if (dropdownMenu.classList.contains('show') &&
                !dropdownMenu.contains(e.target) &&
                e.target !== userDropdown) {
                dropdownMenu.classList.remove('show');
            }
        });
    }

    // ==========================================================
    // 3. NOTIFICATIONS (PC + Mobile) - Redirection vers la page actuelle
    // ==========================================================
    var notifBtnPC = document.getElementById('notifBtnPC');
    var notifBtnMobile = document.getElementById('notifBtnMobile');

    // Les boutons de notification sur la page "Notifications" ne font rien
    // car on est déjà sur la page, mais on peut les désactiver ou les griser

    function handleNotifClick() {
        // On est déjà sur la page notifications, on peut afficher un toast
        showToast('Vous êtes déjà sur la page des notifications');
    }

    if (notifBtnPC) {
        notifBtnPC.addEventListener('click', handleNotifClick);
    }
    if (notifBtnMobile) {
        notifBtnMobile.addEventListener('click', handleNotifClick);
    }

    // ==========================================================
    // 4. BOUTON D'ACTION CONTEXTUEL (mobile) - GRISE
    // ==========================================================
    var btnPlus = document.getElementById('btnPlusMobile');

    function updateActionButton() {
        // Page Notifications : AUCUNE ACTION D'AJOUT
        btnPlus.style.opacity = '0.4';
        btnPlus.style.cursor = 'not-allowed';
        btnPlus.style.pointerEvents = 'none';
        btnPlus.setAttribute('aria-label', 'Aucune action disponible sur cette page');

        btnPlus.replaceWith(btnPlus.cloneNode(true));
        var newBtn = document.getElementById('btnPlusMobile');

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
    // 6. DONNEES FACTICES DES NOTIFICATIONS
    // ==========================================================
    var notificationsData = [
        { id: 1, type: 'visite', title: 'Nouvelle visite planifiée', text: 'Visite commerciale - Magasin A prévue demain à 08:00',
            date: 'Il y a 5 minutes', unread: true },
        { id: 2, type: 'rapport', title: 'Rapport disponible', text: 'Le rapport de la semaine dernière est disponible',
            date: 'Il y a 2 heures', unread: true },
        { id: 3, type: 'alerte', title: 'Visite en retard', text: 'Collecte de paiement - Client D est en retard',
            date: 'Il y a 1 jour', unread: true },
        { id: 4, type: 'info', title: 'Mise à jour système', text: 'Nouvelle version de SuiviTerrain disponible',
            date: 'Il y a 2 jours', unread: false },
        { id: 5, type: 'systeme', title: 'Synchronisation réussie', text: 'Toutes les données ont été synchronisées',
            date: 'Il y a 3 jours', unread: false },
        { id: 6, type: 'visite', title: 'Visite annulée', text: 'Visite commerciale - Magasin C a été annulée',
            date: 'Il y a 4 jours', unread: false },
        { id: 7, type: 'alerte', title: 'Agent absent', text: 'Sarah Niong est indisponible aujourd\'hui',
            date: 'Il y a 5 jours', unread: false },
        { id: 8, type: 'rapport', title: 'Rapport mensuel', text: 'Le rapport du mois de mai est prêt à être consulté',
            date: 'Il y a 6 jours', unread: false }
    ];

    var currentFilter = 'all';

    // ==========================================================
    // 7. AFFICHAGE DES NOTIFICATIONS
    // ==========================================================
    function renderNotifications(filter) {
        var container = document.getElementById('notificationsList');
        if (!container) return;

        var filtered = notificationsData;

        if (filter === 'unread') {
            filtered = notificationsData.filter(function(n) { return n.unread === true; });
        } else if (filter === 'read') {
            filtered = notificationsData.filter(function(n) { return n.unread === false; });
        }

        if (filtered.length === 0) {
            container.innerHTML =
                '<div style="text-align:center;padding:2rem 0;color:#6c757d;font-family:Segoe UI,sans-serif;">' +
                '<i class="bi bi-inbox" style="display:block;font-size:2.5rem;margin-bottom:0.5rem;color:#ced4da;"></i>' +
                'Aucune notification' +
                '</div>';
            return;
        }

        var html = '';
        filtered.forEach(function(n) {
            var unreadClass = n.unread ? 'unread' : '';
            var iconMap = {
                'visite': 'bi bi-calendar-event',
                'rapport': 'bi bi-file-text',
                'alerte': 'bi bi-exclamation-triangle',
                'info': 'bi bi-info-circle',
                'systeme': 'bi bi-gear'
            };
            var icon = iconMap[n.type] || 'bi bi-bell';

            html +=
                '<div class="notification-item ' + unreadClass + '" data-id="' + n.id + '">' +
                '<div class="notif-icon ' + n.type + '"><i class="' + icon + '" aria-hidden="true"></i></div>' +
                '<div class="notif-content">' +
                '<div class="notif-title">' + n.title + '</div>' +
                '<div class="notif-text">' + n.text + '</div>' +
                '<div class="notif-date">' + n.date + '</div>' +
                '</div>' +
                (n.unread ? '<div class="notif-action"><button class="btn-mark-read" data-id="' + n.id + '">Marquer comme lu</button></div>' :
                    '') +
                '</div>';
        });

        container.innerHTML = html;

        // Evenements pour marquer comme lu
        container.querySelectorAll('.btn-mark-read').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var id = parseInt(this.dataset.id);
                var notif = notificationsData.find(function(n) { return n.id === id; });
                if (notif) {
                    notif.unread = false;
                    renderNotifications(currentFilter);
                    updateBadge();
                    showToast('Notification marquee comme lue');
                }
            });
        });
    }

    // ==========================================================
    // 8. BADGE DE NOTIFICATION (mise a jour)
    // ==========================================================
    function updateBadge() {
        var count = notificationsData.filter(function(n) { return n.unread === true; }).length;
        var badges = document.querySelectorAll('.badge-notif');
        badges.forEach(function(badge) {
            badge.textContent = count;
            if (count === 0) {
                badge.style.display = 'none';
            } else {
                badge.style.display = 'flex';
            }
        });

        // Mettre a jour le bouton "Tout marquer comme lu"
        var markAllBtn = document.getElementById('markAllBtn');
        if (markAllBtn) {
            markAllBtn.textContent = 'Tout marquer comme lu (' + count + ')';
            markAllBtn.disabled = count === 0;
        }
    }

    // ==========================================================
    // 9. FILTRES
    // ==========================================================
    var filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                filterBtns.forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderNotifications(currentFilter);
            });
        });
    }

    // ==========================================================
    // 10. TOUT MARQUER COMME LU
    // ==========================================================
    var markAllBtn = document.getElementById('markAllBtn');
    if (markAllBtn) {
        markAllBtn.addEventListener('click', function() {
            if (this.disabled) return;
            notificationsData.forEach(function(n) {
                n.unread = false;
            });
            renderNotifications(currentFilter);
            updateBadge();
            showToast('Toutes les notifications ont ete marquees comme lues');
        });
    }

    // ==========================================================
    // 11. INITIALISATION
    // ==========================================================
    renderNotifications('all');
    updateBadge();
    updateActionButton();

    console.log('Page Notifications chargee');
    console.log(notificationsData.length + ' notifications');
});