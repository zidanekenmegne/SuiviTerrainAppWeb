/**
 * Rapports - Logique de la page
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
    // 3. EXPORT
    // ==========================================================
    function handleExport() {
        showToast('Export en cours...');
        setTimeout(function() {
            showToast('Export termine ! (simulation)');
        }, 1500);
    }

    var exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }

    var mobileExportBtn = document.getElementById('mobileExportBtn');
    if (mobileExportBtn) {
        mobileExportBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleExport();
        });
    }

    var mobileRefreshBtn = document.getElementById('mobileRefreshBtn');
    if (mobileRefreshBtn) {
        mobileRefreshBtn.addEventListener('click', function(e) {
            e.preventDefault();
            renderRapports();
            showToast('Rapports actualises');
        });
    }

    // ==========================================================
    // 4. DONNEES
    // ==========================================================
    var visitesData = [
        { titre: 'Visite commerciale - Magasin A', agent: 'Zidane Fredy', date: '2025-06-12', statut: 'realisee' },
        { titre: 'Collecte de commandes - Client B', agent: 'Sarah Niong', date: '2025-06-11',
        statut: 'realisee' },
        { titre: 'Suivi des retours - Magasin C', agent: 'Zidane Fredy', date: '2025-06-10',
        statut: 'realisee' },
        { titre: 'Collecte de paiement - Client D', agent: 'Jean Dupont', date: '2025-06-09',
        statut: 'realisee' },
        { titre: 'Collecte de paiement - Magasin E', agent: 'Sarah Niong', date: '2025-06-08',
        statut: 'retard' },
        { titre: 'Presentation produit - Client F', agent: 'Zidane Fredy', date: '2025-06-07',
        statut: 'realisee' },
        { titre: 'Visite de suivi - Magasin G', agent: 'Marie Claire', date: '2025-06-05', statut: 'realisee' },
        { titre: 'Collecte de commandes - Client H', agent: 'Jean Dupont', date: '2025-06-04',
        statut: 'retard' },
        { titre: 'Visite commerciale - Magasin I', agent: 'Zidane Fredy', date: '2025-06-02',
        statut: 'realisee' },
        { titre: 'Collecte de paiement - Client J', agent: 'Sarah Niong', date: '2025-06-01',
        statut: 'realisee' },
        { titre: 'Visite de prospection - Client K', agent: 'Zidane Fredy', date: '2025-05-30',
        statut: 'attente' },
        { titre: 'Collecte de donnees - Client L', agent: 'Marie Claire', date: '2025-05-28',
        statut: 'realisee' },
        { titre: 'Visite commerciale - Magasin M', agent: 'Jean Dupont', date: '2025-05-25',
        statut: 'encours' },
        { titre: 'Suivi client N', agent: 'Sarah Niong', date: '2025-05-22', statut: 'realisee' },
        { titre: 'Visite de suivi - Magasin O', agent: 'Zidane Fredy', date: '2025-05-20', statut: 'realisee' }
    ];

    // ==========================================================
    // 5. FILTRES
    // ==========================================================
    var currentFilter = 'month';
    var currentAgent = 'all';
    var currentStatut = 'all';

    function getFilteredData() {
        var data = visitesData.slice();

        var now = new Date();
        if (currentFilter === 'month') {
            var monthStart = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            data = data.filter(function(item) { return new Date(item.date) >= monthStart; });
        } else if (currentFilter === 'quarter') {
            var quarterStart = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            data = data.filter(function(item) { return new Date(item.date) >= quarterStart; });
        } else if (currentFilter === 'year') {
            var yearStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            data = data.filter(function(item) { return new Date(item.date) >= yearStart; });
        }

        if (currentAgent !== 'all') {
            data = data.filter(function(item) { return item.agent === currentAgent; });
        }

        if (currentStatut !== 'all') {
            data = data.filter(function(item) { return item.statut === currentStatut; });
        }

        return data;
    }

    // ==========================================================
    // 6. RENDU
    // ==========================================================
    function renderRapports() {
        var data = getFilteredData();

        var total = data.length;
        var realisees = data.filter(function(d) { return d.statut === 'realisee'; }).length;
        var attente = data.filter(function(d) { return d.statut === 'attente' || d.statut === 'encours'; }).length;
        var taux = total > 0 ? Math.round((realisees / total) * 100) : 0;

        document.getElementById('totalVisites').textContent = total;
        document.getElementById('totalRealisees').textContent = realisees;
        document.getElementById('totalAttente').textContent = attente;
        document.getElementById('tauxReussite').textContent = taux + '%';

        renderStatutChart(data);
        renderEvolutionChart(data);
        renderPerformanceTable(data);
    }

    // ==========================================================
    // 7. GRAPHIQUE : REPARTITION PAR STATUT
    // ==========================================================
    function renderStatutChart(data) {
        var container = document.getElementById('statutChart');
        var statuts = {
            'realisee': { label: 'Realisees', color: 'vert', count: 0 },
            'encours': { label: 'En cours', color: 'bleu', count: 0 },
            'attente': { label: 'En attente', color: 'orange', count: 0 },
            'retard': { label: 'En retard', color: 'rouge', count: 0 }
        };

        data.forEach(function(d) {
            if (statuts[d.statut]) statuts[d.statut].count++;
        });

        var maxCount = Math.max.apply(null, Object.values(statuts).map(function(s) { return s.count; }));
        if (maxCount === 0) maxCount = 1;

        var html = '';
        for (var key in statuts) {
            var s = statuts[key];
            var percent = Math.round((s.count / maxCount) * 100);
            html +=
                '<div class="chart-bar-item">' +
                '<span class="bar-label">' + s.label + '</span>' +
                '<div class="bar-track">' +
                '<div class="bar-fill ' + s.color + '" style="width:' + percent + '%;"></div>' +
                '</div>' +
                '<span class="bar-value">' + s.count + '</span>' +
                '</div>';
        }
        container.innerHTML = html;
    }

    // ==========================================================
    // 8. GRAPHIQUE : EVOLUTION MENSUELLE
    // ==========================================================
    function renderEvolutionChart(data) {
        var container = document.getElementById('evolutionChart');

        var months = {};
        data.forEach(function(d) {
            var month = d.date.substring(0, 7);
            if (!months[month]) months[month] = 0;
            months[month]++;
        });

        var sortedMonths = Object.keys(months).sort();
        var maxCount = Math.max.apply(null, Object.values(months));
        if (maxCount === 0) maxCount = 1;

        var html = '';
        sortedMonths.forEach(function(month) {
            var label = month.substring(5, 7) + '/' + month.substring(2, 4);
            var percent = Math.round((months[month] / maxCount) * 100);
            html +=
                '<div class="chart-bar-item">' +
                '<span class="bar-label">' + label + '</span>' +
                '<div class="bar-track">' +
                '<div class="bar-fill rouge" style="width:' + percent + '%;"></div>' +
                '</div>' +
                '<span class="bar-value">' + months[month] + '</span>' +
                '</div>';
        });

        container.innerHTML = html || '<p style="text-align:center;color:#6c757d;font-size:0.8rem;">Aucune donnee disponible</p>';
    }

    // ==========================================================
    // 9. TABLEAU DES PERFORMANCES PAR AGENT
    // ==========================================================
    function renderPerformanceTable(data) {
        var tbody = document.getElementById('performanceBody');

        var agents = {};
        data.forEach(function(d) {
            if (!agents[d.agent]) {
                agents[d.agent] = { total: 0, realisees: 0, attente: 0, retard: 0 };
            }
            agents[d.agent].total++;
            if (d.statut === 'realisee') agents[d.agent].realisees++;
            else if (d.statut === 'attente' || d.statut === 'encours') agents[d.agent].attente++;
            else if (d.statut === 'retard') agents[d.agent].retard++;
        });

        var agentKeys = Object.keys(agents);
        if (agentKeys.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="6" style="text-align:center;padding:1.5rem 0;color:#6c757d;">Aucune donnee disponible pour cette periode</td></tr>';
            return;
        }

        var html = '';
        agentKeys.forEach(function(agent) {
            var stats = agents[agent];
            var taux = stats.total > 0 ? Math.round((stats.realisees / stats.total) * 100) : 0;
            html +=
                '<tr>' +
                '<td><strong>' + agent + '</strong></td>' +
                '<td>' + stats.total + '</td>' +
                '<td style="color:#28a745;">' + stats.realisees + '</td>' +
                '<td style="color:#ffc107;">' + stats.attente + '</td>' +
                '<td style="color:#dc3545;">' + stats.retard + '</td>' +
                '<td><strong>' + taux + '%</strong></td>' +
                '</tr>';
        });

        tbody.innerHTML = html;
    }

    // ==========================================================
    // 10. FILTRES
    // ==========================================================
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderRapports();
        });
    });

    var agentFilter = document.getElementById('agentFilter');
    if (agentFilter) {
        agentFilter.addEventListener('change', function() {
            currentAgent = this.value;
            renderRapports();
        });
    }

    var statutFilter = document.getElementById('statutFilter');
    if (statutFilter) {
        statutFilter.addEventListener('change', function() {
            currentStatut = this.value;
            renderRapports();
        });
    }

    // ==========================================================
    // 11. TOAST
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
    // 12. RECHERCHE GENERALE (placeholder)
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
    // 13. INITIALISATION
    // ==========================================================
    renderRapports();
    console.log('Page Rapports chargee');
});