/**
 * Navbar - Logique de la barre de navigation
 * Version 2.0
 */

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
    // 2. NOTIFICATIONS (PC)
    // ==========================================================
    var notifBtnPC = document.getElementById('notifBtnPC');
    if (notifBtnPC) {
        notifBtnPC.addEventListener('click', function() {
            window.location.href = 'notifications.html';
        });
    }

    // ==========================================================
    // 3. NOTIFICATIONS (Mobile)
    // ==========================================================
    var notifBtnMobile = document.getElementById('notifBtnMobile');
    if (notifBtnMobile) {
        notifBtnMobile.addEventListener('click', function() {
            window.location.href = 'notifications.html';
        });
    }

    // ==========================================================
    // 4. DROPDOWN PROFIL (PC)
    // ==========================================================
    var dropdownToggle = document.getElementById('userDropdown');
    var dropdownMenu = document.getElementById('dropdownMenu');

    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', function(e) {
            e.preventDefault();
            dropdownMenu.classList.toggle('show');
        });
    }

    // ==========================================================
    // 5. FERMER LE DROPDOWN EN CLIQUANT AILLEURS
    // ==========================================================
    document.addEventListener('click', function(e) {
        var menus = document.querySelectorAll('.dropdown-menu');
        menus.forEach(function(menu) {
            if (!menu.parentElement.contains(e.target)) {
                menu.classList.remove('show');
            }
        });
    });

    console.log('Navbar chargee');
});