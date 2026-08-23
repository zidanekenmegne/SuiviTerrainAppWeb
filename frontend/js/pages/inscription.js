/**
 * Inscription - Logique de la page
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

            // Validation des champs obligatoires
            if (!nom || !email || !motdepasse || !confirmPassword) {
                if (messageErreur) {
                    messageErreur.classList.remove('d-none');
                    erreurTexte.textContent = 'Veuillez remplir tous les champs.';
                }
                return;
            }

            // Validation de l'email
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                if (messageErreur) {
                    messageErreur.classList.remove('d-none');
                    erreurTexte.textContent = 'Veuillez saisir un email valide.';
                }
                return;
            }

            // Validation de la longueur du mot de passe (minimum 6 caracteres)
            if (motdepasse.length < 6) {
                if (messageErreur) {
                    messageErreur.classList.remove('d-none');
                    erreurTexte.textContent = 'Le mot de passe doit contenir au moins 6 caracteres.';
                }
                return;
            }

            // Validation de la confirmation du mot de passe
            if (motdepasse !== confirmPassword) {
                if (messageErreur) {
                    messageErreur.classList.remove('d-none');
                    erreurTexte.textContent = 'Les mots de passe ne correspondent pas.';
                }
                return;
            }

            // Simulation d'inscription reussie
            if (messageErreur) {
                messageErreur.classList.add('d-none');
            }

            // Afficher un message de succes et rediriger
            showToast('Compte cree avec succes !', 'success');
            
            setTimeout(function() {
                window.location.href = 'connexion.html';
            }, 1500);
        });
    }

});