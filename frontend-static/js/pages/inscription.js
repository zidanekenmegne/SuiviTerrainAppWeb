/**
 * Inscription - Logique de la page
 * Version 1.0
 */

document.addEventListener('DOMContentLoaded', function() {

    // ==========================================================
    // 1. AFFICHER / MASQUER LE MOT DE PASSE (OEIL)
    // ==========================================================
    var togglePasswordButton = document.getElementById('togglePassword');
    var motdepasseInput = document.getElementById('motdepasse');
    var eyeIcon = document.getElementById('eyeIcon');

    if (togglePasswordButton && motdepasseInput && eyeIcon) {
        togglePasswordButton.addEventListener('click', function() {
            var type = motdepasseInput.getAttribute('type') === 'password' ? 'text' : 'password';
            motdepasseInput.setAttribute('type', type);

            if (type === 'password') {
                eyeIcon.classList.remove('bi-eye-slash');
                eyeIcon.classList.add('bi-eye');
            } else {
                eyeIcon.classList.remove('bi-eye');
                eyeIcon.classList.add('bi-eye-slash');
            }
        });
    }

    // ==========================================================
    // 2. GESTION DU FORMULAIRE D'INSCRIPTION
    // ==========================================================
    var formInscription = document.getElementById('form-inscription');
    var messageErreur = document.getElementById('message-erreur');
    var erreurTexte = document.getElementById('erreur-texte');

    if (formInscription) {
        formInscription.addEventListener('submit', function(event) {
            event.preventDefault();

            var nom = document.getElementById('nom').value.trim();
            var email = document.getElementById('email').value.trim();
            var motdepasse = document.getElementById('motdepasse').value.trim();
            var confirmPassword = document.getElementById('confirm_password').value.trim();
            var role = document.getElementById('role').value;

            if (!nom || !email || !motdepasse || !confirmPassword) {
                if (messageErreur) {
                    messageErreur.classList.remove('d-none');
                    erreurTexte.textContent = 'Veuillez remplir tous les champs.';
                }
                return;
            }

            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                if (messageErreur) {
                    messageErreur.classList.remove('d-none');
                    erreurTexte.textContent = 'Veuillez saisir un email valide.';
                }
                return;
            }

            if (motdepasse.length < 6) {
                if (messageErreur) {
                    messageErreur.classList.remove('d-none');
                    erreurTexte.textContent = 'Le mot de passe doit contenir au moins 6 caracteres.';
                }
                return;
            }

            if (motdepasse !== confirmPassword) {
                if (messageErreur) {
                    messageErreur.classList.remove('d-none');
                    erreurTexte.textContent = 'Les mots de passe ne correspondent pas.';
                }
                return;
            }

            if (messageErreur) {
                messageErreur.classList.add('d-none');
            }

            showToast('Compte cree avec succes !', 'success');

            setTimeout(function() {
                window.location.href = 'connexion.html';
            }, 1500);
        });
    }

});