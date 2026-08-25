// ==========================================================
// PLANNING DES VISITES - SuiviTerrain
// ==========================================================

document.addEventListener('DOMContentLoaded', function() {

    // ==========================================================
    // RETOUR (mobile)
    // ==========================================================
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.history.back();
        });
    }

    // ==========================================================
    // NOTIFICATIONS (PC + Mobile)
    // ==========================================================
    const notifBtnPC = document.getElementById('notifBtnPC');
    const notifBtnMobile = document.getElementById('notifBtnMobile');

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
    // DONNÉES FACTICES
    // ==========================================================
    const visitesData = [
        { id: 1, titre: 'Visite commerciale - Magasin A', adresse: 'Centre-ville', date: '2025-06-12', heure: '08:00', statut: 'realise', agent: 'Zidane' },
        { id: 2, titre: 'Collecte de commandes - Client B', adresse: 'Bonamoussadi', date: '2025-06-12', heure: '10:30', statut: 'attente', agent: 'Zidane' },
        { id: 3, titre: 'Suivi des retours - Magasin C', adresse: 'Akwa', date: '2025-06-12', heure: '13:00', statut: 'retard', agent: 'Zidane' },
        { id: 4, titre: 'Collecte de paiement - Client D', adresse: 'Bépanda', date: '2025-06-13', heure: '09:00', statut: 'realise', agent: 'Zidane' },
        { id: 5, titre: 'Collecte de paiement - Magasin E', adresse: 'Total Logbaba', date: '2025-06-13', heure: '11:00', statut: 'attente', agent: 'Zidane' },
        { id: 6, titre: 'Presentation produit - Client F', adresse: 'Makape', date: '2025-06-14', heure: '15:00', statut: 'encours', agent: 'Zidane' },
        { id: 7, titre: 'Visite de suivi - Magasin G', adresse: 'Bonapriso', date: '2025-06-15', heure: '09:30', statut: 'realise', agent: 'Zidane' },
        { id: 8, titre: 'Collecte de commandes - Client H', adresse: 'Makepe', date: '2025-06-15', heure: '14:00', statut: 'attente', agent: 'Zidane' },
        { id: 9, titre: 'Visite commerciale - Magasin I', adresse: 'Kotto', date: '2025-06-16', heure: '10:00', statut: 'encours', agent: 'Zidane' },
        { id: 10, titre: 'Collecte de paiement - Client J', adresse: 'Mbangue', date: '2025-06-17', heure: '11:30', statut: 'retard', agent: 'Zidane' },
    ];

    // ==========================================================
    // CALENDRIER
    // ==========================================================
    let currentDate = new Date();
    let selectedDate = new Date();

    const monthNames = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];
    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    function formatDate(date) {
        const d = new Date(date);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function formatDisplayDate(date) {
        const d = new Date(date);
        const dayOfWeek = dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1];
        return dayOfWeek + ' ' + d.getDate() + ' ' + monthNames[d.getMonth()] + ' ' + d.getFullYear();
    }

    function getVisitesForDate(dateStr) {
        return visitesData.filter(function(v) {
            return v.date === dateStr;
        });
    }

    function renderCalendar(year, month) {
        const grid = document.getElementById('daysGrid');
        const display = document.getElementById('monthYearDisplay');
        display.textContent = monthNames[month] + ' ' + year;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        const daysInMonth = lastDay.getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        let html = '';
        const todayStr = formatDate(new Date());
        const selectedStr = formatDate(selectedDate);

        // Jours du mois precedent
        for (let i = startDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            html += '<div class="day-cell">' +
                '<span class="day-number other-month">' + day + '</span>' +
                '</div>';
        }

        // Jours du mois courant
        for (let i = 1; i <= daysInMonth; i++) {
            const dateObj = new Date(year, month, i);
            const dateStr = formatDate(dateObj);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedStr;
            const visites = getVisitesForDate(dateStr);

            let dotHtml = '';
            const statuts = visites.map(function(v) { return v.statut; });
            const uniqueStatuts = [...new Set(statuts)];
            uniqueStatuts.forEach(function(s) {
                dotHtml += '<span class="event-dot ' + s + '"></span>';
            });

            const countHtml = visites.length > 0 ? '<span class="day-event-count">' + visites.length + '</span>' : '';

            let dayClass = 'day-number';
            if (isToday) dayClass += ' today';
            if (isSelected) dayClass += ' selected';

            html += '<div class="day-cell" data-date="' + dateStr + '" onclick="selectDate(\'' + dateStr + '\')">' +
                '<span class="' + dayClass + '">' + i + '</span>' +
                '<div class="day-events">' + dotHtml + '</div>' +
                countHtml +
                '</div>';
        }

        // Jours du mois suivant
        const totalCells = startDay + daysInMonth;
        const remainingCells = 7 - (totalCells % 7);
        if (remainingCells < 7) {
            for (let i = 1; i <= remainingCells; i++) {
                html += '<div class="day-cell">' +
                    '<span class="day-number other-month">' + i + '</span>' +
                    '</div>';
            }
        }

        grid.innerHTML = html;

        // Mettre à jour la liste des visites du jour
        updateDayVisites(selectedStr);
        updateMobilePlanning(selectedStr);
    }

    function updateDayVisites(dateStr) {
        const container = document.getElementById('dayVisitesContainer');
        const title = document.getElementById('dayVisitesTitle');

        const displayDate = formatDisplayDate(dateStr);
        title.textContent = 'Visites du ' + displayDate;

        const visites = getVisitesForDate(dateStr);

        if (visites.length === 0) {
            container.innerHTML = '<p class="text-muted text-center py-3" style="font-family: Segoe UI, sans-serif; font-size: 0.9rem;">Aucune visite prevue ce jour.</p>';
            return;
        }

        let html = '';
        visites.forEach(function(v) {
            var statutLabel = v.statut.charAt(0).toUpperCase() + v.statut.slice(1);
            html += '<div class="visite-item" onclick="window.location.href=\'detail-visite.html\'">' +
                '<div class="visite-info">' +
                '<p class="visite-titre">' + v.titre + '</p>' +
                '<p class="visite-detail">' +
                '<i class="bi bi-geo-alt" aria-hidden="true"></i> ' + v.adresse + ' &bull; ' +
                '<i class="bi bi-clock" aria-hidden="true"></i> ' + v.heure + ' &bull; ' +
                '<i class="bi bi-person" aria-hidden="true"></i> ' + v.agent +
                '</p>' +
                '</div>' +
                '<span class="badge-status ' + v.statut + '">' + statutLabel + '</span>' +
                '</div>';
        });
        container.innerHTML = html;
    }

    function updateMobilePlanning(dateStr) {
        const label = document.getElementById('mobileDateLabel');
        const container = document.getElementById('mobileVisitesContainer');
        const title = document.getElementById('mobileDayTitle');

        const displayDate = formatDisplayDate(dateStr);
        title.textContent = 'Visites du ' + displayDate;
        label.textContent = displayDate;

        const visites = getVisitesForDate(dateStr);

        if (visites.length === 0) {
            container.innerHTML = '<p class="text-muted text-center py-2" style="font-family: Segoe UI, sans-serif; font-size: 0.8rem;">Aucune visite prevue</p>';
            return;
        }

        let html = '';
        visites.forEach(function(v) {
            var statutLabel = v.statut.charAt(0).toUpperCase() + v.statut.slice(1);
            html += '<div class="mobile-visite-item" onclick="window.location.href=\'detail-visite.html\'">' +
                '<div class="mv-info">' +
                '<p class="mv-titre">' + v.titre + '</p>' +
                '<p class="mv-detail">' +
                '<i class="bi bi-clock" aria-hidden="true"></i> ' + v.heure + ' &bull; ' + v.agent +
                '</p>' +
                '</div>' +
                '<span class="badge-status ' + v.statut + '">' + statutLabel + '</span>' +
                '</div>';
        });
        container.innerHTML = html;
    }

    window.selectDate = function(dateStr) {
        selectedDate = new Date(dateStr + 'T00:00:00');
        renderCalendar(selectedDate.getFullYear(), selectedDate.getMonth());
    };

    // ==========================================================
    // NAVIGATION CALENDRIER
    // ==========================================================
    document.getElementById('prevMonth').addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    document.getElementById('nextMonth').addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    document.getElementById('todayBtn').addEventListener('click', function() {
        var today = new Date();
        currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
        selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    document.getElementById('datePickerBtn').addEventListener('click', function() {
        var picker = document.getElementById('datePicker');
        if (picker.showPicker) {
            picker.showPicker();
        } else {
            picker.click();
        }
    });

    document.getElementById('datePicker').addEventListener('change', function() {
        var val = this.value;
        if (val) {
            var parts = val.split('-');
            var year = parseInt(parts[0]);
            var month = parseInt(parts[1]) - 1;
            var day = parseInt(parts[2]);
            currentDate = new Date(year, month, 1);
            selectedDate = new Date(year, month, day);
            renderCalendar(year, month);
        }
    });

    // ==========================================================
    // NAVIGATION MOBILE (JOURS)
    // ==========================================================
    document.getElementById('prevDayMobile').addEventListener('click', function() {
        var newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        selectedDate = newDate;
        renderCalendar(selectedDate.getFullYear(), selectedDate.getMonth());
    });

    document.getElementById('nextDayMobile').addEventListener('click', function() {
        var newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        selectedDate = newDate;
        renderCalendar(selectedDate.getFullYear(), selectedDate.getMonth());
    });

    // ==========================================================
    // INITIALISATION
    // ==========================================================
    var today = new Date();
    currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
    selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    renderCalendar(currentDate.getFullYear(), currentDate.getMonth());

    console.log('Page Planning des visites chargee');
});