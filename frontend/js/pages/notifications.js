/**
 * Notifications - Logique de la page
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
    // 3. DONNEES FACTICES
    // ==========================================================
    var notifications = [
        { id: 1, type: 'visite', icon: 'bi bi-calendar-check', iconClass: 'visite',
            title: 'Nouvelle visite assignee',
            text: 'Vous avez une nouvelle visite : Evaluation des sols - Champ Ouest, Parcelle 7',
            date: 'il y a 2 heures', read: false, url: 'detail-visite.html' },
        { id: 2, type: 'rapport', icon: 'bi bi-file-text', iconClass: 'rapport',
            title: 'Rapport soumis',
            text: 'Jean Dupont a soumis le rapport de la visite du 12 juin 2025',
            date: 'il y a 4 heures', read: false, url: 'rapport.html' },
        { id: 3, type: 'alerte', icon: 'bi bi-exclamation-triangle', iconClass: 'alerte',
            title: 'Visite en retard',
            text: 'La visite de suivi client B est en retard de 2 heures',
            date: 'il y a 5 heures', read: false, url: 'detail-visite.html' },
        { id: 4, type: 'info', icon: 'bi bi-info-circle', iconClass: 'info',
            title: 'Mise a jour disponible',
            text: 'Une nouvelle version de l\'application est disponible (v2.1.0)',
            date: 'hier a 10:30', read: true, url: '#' },
        { id: 5, type: 'systeme', icon: 'bi bi-gear', iconClass: 'systeme',
            title: 'Maintenance planifiee',
            text: 'Le serveur sera en maintenance le 15 juin 2025 de 02:00 a 04:00',
            date: 'hier a 08:15', read: true, url: '#' },
        { id: 6, type: 'visite', icon: 'bi bi-calendar-check', iconClass: 'visite',
            title: 'Visite realisee',
            text: 'La visite commerciale Magasin A a ete marquee comme realisee',
            date: 'avant-hier a 16:45', read: true, url: 'detail-visite.html' },
        { id: 7, type: 'rapport', icon: 'bi bi-file-text', iconClass: 'rapport',
            title: 'Rapport en attente',
            text: 'Vous avez 3 rapports en attente de validation',
            date: 'avant-hier a 09:20', read: true, url: 'rapports.html' },
        { id: 8, type: 'alerte', icon: 'bi bi-exclamation-triangle', iconClass: 'alerte',
            title: 'Probleme de connexion',
            text: 'Le mode hors ligne est active, certaines donnees sont en attente de synchronisation',
            date: '3 jours', read: true, url: 'hors-ligne.html' }
    ];

    // ==========================================================
    // 4. MISE A JOUR DU BADGE
    // ==========================================================
    function updateBadge() {
        var unreadCount = 0;
        for (var i = 0; i < notifications.length; i++) {
            if (!notifications[i].read) {
                unreadCount++;
            }
        }
        var badges = document.querySelectorAll('.badge-notif');
        badges.forEach(function(badge) {
            if (unreadCount === 0) {
                badge.style.display = 'none';
            } else {
                badge.style.display = 'flex';
                badge.textContent = unreadCount;
            }
        });
    }

    // ==========================================================
    // 5. MISE A JOUR DU BOUTON "TOUT MARQUER COMME LU"
    // ==========================================================
    function updateMarkAllButton() {
        var btn = document.getElementById('markAllBtn');
        var unreadCount = 0;
        for (var i = 0; i < notifications.length; i++) {
            if (!notifications[i].read) {
                unreadCount++;
            }
        }
        if (unreadCount === 0) {
            btn.disabled = true;
            btn.textContent = 'Tout est lu';
        } else {
            btn.disabled = false;
            btn.textContent = 'Tout marquer comme lu (' + unreadCount + ')';
        }
        updateBadge();
    }

    // ==========================================================
    // 6. AFFICHAGE DES NOTIFICATIONS
    // ==========================================================
    var container = document.getElementById('notificationsList');
    var currentFilter = 'all';

    function renderNotifications(filter) {
        var filtered = [];
        if (filter === 'unread') {
            filtered = notifications.filter(function(n) { return !n.read; });
        } else if (filter === 'read') {
            filtered = notifications.filter(function(n) { return n.read; });
        } else {
            filtered = notifications.slice();
        }

        if (filtered.length === 0) {
            container.innerHTML =
                '<div style="text-align:center;padding:3rem 1rem;color:#6c757d;">' +
                '<i class="bi bi-inbox" style="font-size:2.5rem;display:block;margin-bottom:0.5rem;color:#ced4da;"></i>' +
                '<p style="font-family:Segoe UI,sans-serif;font-size:0.9rem;">' +
                (filter === 'all' ? 'Aucune notification' :
                    filter === 'unread' ? 'Aucune notification non lue' :
                    'Aucune notification lue') +
                '</p>' +
                '</div>';
            updateMarkAllButton();
            return;
        }

        var html = '';
        filtered.forEach(function(n) {
            var unreadClass = n.read ? '' : 'unread';
            html +=
                '<div class="notification-item ' + unreadClass + '" data-id="' + n.id + '">' +
                '<div class="notif-icon ' + n.iconClass + '">' +
                '<i class="' + n.icon + '" aria-hidden="true"></i>' +
                '</div>' +
                '<div class="notif-content">' +
                '<div class="notif-title">' + n.title + '</div>' +
                '<div class="notif-text">' + n.text + '</div>' +
                '<div class="notif-date"><i class="bi bi-clock" aria-hidden="true"></i> ' + n.date + '</div>' +
                '</div>' +
                '<div class="notif-action">' +
                (!n.read ? '<button class="btn-mark-read" data-id="' + n.id + '">Marquer comme lu</button>' : '') +
                '</div>' +
                '</div>';
        });

        container.innerHTML = html;

        document.querySelectorAll('.btn-mark-read').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var id = parseInt(this.dataset.id);
                var notif = notifications.find(function(n) { return n.id === id; });
                if (notif) {
                    notif.read = true;
                    renderNotifications(currentFilter);
                    updateMarkAllButton();
                }
            });
        });

        document.querySelectorAll('.notification-item').forEach(function(item) {
            item.addEventListener('click', function() {
                var id = parseInt(this.dataset.id);
                var notif = notifications.find(function(n) { return n.id === id; });
                if (notif) {
                    if (!notif.read) {
                        notif.read = true;
                        renderNotifications(currentFilter);
                        updateMarkAllButton();
                    }
                    if (notif.url && notif.url !== '#') {
                        window.location.href = notif.url;
                    }
                }
            });
        });

        updateMarkAllButton();
    }

    // ==========================================================
    // 7. BOUTON "TOUT MARQUER COMME LU"
    // ==========================================================
    document.getElementById('markAllBtn').addEventListener('click', function() {
        var unread = notifications.filter(function(n) { return !n.read; });
        if (unread.length === 0) return;

        if (confirm('Marquer les ' + unread.length + ' notification(s) non lue(s) comme lues ?')) {
            notifications.forEach(function(n) { n.read = true; });
            renderNotifications(currentFilter);
            updateMarkAllButton();
        }
    });

    // ==========================================================
    // 8. FILTRES
    // ==========================================================
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderNotifications(currentFilter);
        });
    });

    // ==========================================================
    // 9. TOAST
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
    // 10. RECHERCHE GENERALE (placeholder)
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
    // 11. INITIALISATION
    // ==========================================================
    renderNotifications('all');
    updateBadge();
    console.log('Page Notifications chargee');
});