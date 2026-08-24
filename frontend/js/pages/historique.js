/**
 * Historique des visites - Logique de la page
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
    var historiqueData = [
        { id: 1, titre: 'Visite commerciale - Magasin A', adresse: 'Centre-ville', date: '12 juin 2025',
            heure: '08:00', statut: 'realisee', agent: 'Zidane Fredy' },
        { id: 2, titre: 'Collecte de commandes - Client B', adresse: 'Bonamoussadi', date: '11 juin 2025',
            heure: '10:30', statut: 'realisee', agent: 'Sarah Niong' },
        { id: 3, titre: 'Suivi des retours - Magasin C', adresse: 'Akwa', date: '10 juin 2025',
            heure: '13:00', statut: 'realisee', agent: 'Zidane Fredy' },
        { id: 4, titre: 'Collecte de paiement - Client D', adresse: 'Bepanda', date: '09 juin 2025',
            heure: '09:00', statut: 'realisee', agent: 'Jean Dupont' },
        { id: 5, titre: 'Collecte de paiement - Magasin E', adresse: 'Total Logbaba', date: '08 juin 2025',
            heure: '11:00', statut: 'retard', agent: 'Sarah Niong' },
        { id: 6, titre: 'Presentation produit - Client F', adresse: 'Makape', date: '07 juin 2025',
            heure: '15:00', statut: 'realisee', agent: 'Zidane Fredy' },
        { id: 7, titre: 'Visite de suivi - Magasin G', adresse: 'Bonapriso', date: '05 juin 2025',
            heure: '09:30', statut: 'realisee', agent: 'Marie Claire' },
        { id: 8, titre: 'Collecte de commandes - Client H', adresse: 'Makepe', date: '04 juin 2025',
            heure: '14:00', statut: 'retard', agent: 'Jean Dupont' },
        { id: 9, titre: 'Visite commerciale - Magasin I', adresse: 'Kotto', date: '02 juin 2025',
            heure: '10:00', statut: 'realisee', agent: 'Zidane Fredy' },
        { id: 10, titre: 'Collecte de paiement - Client J', adresse: 'Mbangue', date: '01 juin 2025',
            heure: '11:30', statut: 'realisee', agent: 'Sarah Niong' },
        { id: 11, titre: 'Visite de prospection - Client K', adresse: 'Bassa', date: '30 mai 2025',
            heure: '08:30', statut: 'planifie', agent: 'Zidane Fredy' },
        { id: 12, titre: 'Collecte de donnees - Client L', adresse: 'Akwa', date: '28 mai 2025',
            heure: '13:30', statut: 'realisee', agent: 'Marie Claire' }
    ];

    // ==========================================================
    // 4. FILTRES
    // ==========================================================
    var currentFilter = 'all';

    function getFilteredData(filter, searchTerm) {
        var data = historiqueData.slice();

        var now = new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (filter === 'today') {
            data = data.filter(function(item) {
                var itemDate = new Date(item.date + ' ' + item.heure);
                return itemDate >= today;
            });
        } else if (filter === 'week') {
            var weekStart = new Date(today);
            weekStart.setDate(today.getDate() - 7);
            data = data.filter(function(item) {
                var itemDate = new Date(item.date + ' ' + item.heure);
                return itemDate >= weekStart;
            });
        } else if (filter === 'month') {
            var monthStart = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            data = data.filter(function(item) {
                var itemDate = new Date(item.date + ' ' + item.heure);
                return itemDate >= monthStart;
            });
        }

        if (searchTerm && searchTerm.trim()) {
            var term = searchTerm.toLowerCase().trim();
            data = data.filter(function(item) {
                return item.titre.toLowerCase().includes(term) ||
                    item.adresse.toLowerCase().includes(term) ||
                    item.agent.toLowerCase().includes(term);
            });
        }

        return data;
    }

    // ==========================================================
    // 5. AFFICHAGE (mobile-first, compact)
    // ==========================================================
    function renderHistorique(filter) {
        var searchTerm = document.getElementById('searchHistorique').value;
        var data = getFilteredData(filter, searchTerm);
        var container = document.getElementById('historiqueList');

        if (data.length === 0) {
            container.innerHTML =
                '<div style="text-align:center;padding:3rem 1rem;color:#6c757d;background:#ffffff;border-radius:16px;">' +
                '<i class="bi bi-inbox" style="font-size:2.5rem;display:block;margin-bottom:0.5rem;color:#ced4da;"></i>' +
                '<p style="font-family:Segoe UI,sans-serif;font-size:0.9rem;">Aucune visite dans l\'historique pour cette periode</p>' +
                '</div>';
            return;
        }

        var html = '';
        data.forEach(function(item) {
            var statutLabel = {
                'realisee': 'Realisee',
                'attente': 'En attente',
                'retard': 'En retard',
                'encours': 'En cours',
                'planifie': 'Planifie'
            } [item.statut] || item.statut;

            html +=
                '<div class="historique-item" onclick="window.location.href=\'detail-visite.html?id=' + item.id +
                '\'">' +
                '<div class="hi-info">' +
                '<div class="hi-titre">' + item.titre + '</div>' +
                '<div class="hi-detail">' +
                '<i class="bi bi-geo-alt" aria-hidden="true"></i> ' + item.adresse + ' &bull; ' +
                '<i class="bi bi-person" aria-hidden="true"></i> ' + item.agent +
                '</div>' +
                '</div>' +
                '<div class="hi-actions">' +
                '<span class="hi-date"><i class="bi bi-clock" aria-hidden="true"></i> ' + item.date + '</span>' +
                '<span class="badge-status ' + item.statut + '">' + statutLabel + '</span>' +
                '</div>' +
                '</div>';
        });

        container.innerHTML = html;
    }

    // ==========================================================
    // 6. FILTRES
    // ==========================================================
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderHistorique(currentFilter);
        });
    });

    // ==========================================================
    // 7. RECHERCHE
    // ==========================================================
    var searchInput = document.getElementById('searchHistorique');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            renderHistorique(currentFilter);
        });
    }

    // ==========================================================
    // 8. TOAST
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
    // 9. RECHERCHE GENERALE (placeholder)
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
    renderHistorique('all');
    console.log('Page Historique des visites chargee');
});