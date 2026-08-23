/**
 * Connexion - Logique de la page
 * Identifiants de test : admin@suiviterrain.com / admin123
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
    // 2. GESTION DU FORMULAIRE DE CONNEXION
    // ==========================================================
    var formConnexion = document.getElementById('form-connexion');
    var messageErreur = document.getElementById('message-erreur');

    if (formConnexion) {
        formConnexion.addEventListener('submit', function(event) {
            event.preventDefault();

            var email = document.getElementById('email').value.trim();
            var motdepasse = document.getElementById('motdepasse').value.trim();

            if (!email || !motdepasse) {
                if (messageErreur) {
                    messageErreur.classList.remove('d-none');
                    messageErreur.textContent = 'Veuillez remplir tous les champs.';
                }
                return;
            }

            if (email === 'admin@suiviterrain.com' && motdepasse === 'admin123') {
                if (messageErreur) {
                    messageErreur.classList.add('d-none');
                }
                window.location.href = 'tableau-bord.html';
            } else {
                if (messageErreur) {
                    messageErreur.classList.remove('d-none');
                    messageErreur.textContent = 'Email ou mot de passe incorrect.';
                }
            }
        });
    }

});
