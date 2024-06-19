document.addEventListener('DOMContentLoaded', function() {
    if(document.getElementById('registerForm')) {
        const form = document.getElementById('registerForm');
        form.addEventListener('submit', function(event) {
            if (!registerCheck()) {
                event.preventDefault(); // Empêche l'envoi du formulaire si des erreurs sont présentes
            }
        });
    }

   
});

function registerCheck() {
    let prenom = document.querySelector("#firstname").value.trim();
    let nom = document.querySelector("#lastname").value.trim();
    let email = document.querySelector("#email").value.trim();
    let date = document.getElementById('date').value.trim();
    let password = document.querySelector("#password").value.trim();
    let password2 = document.querySelector("#confPassword").value.trim();
    let postalCode = document.querySelector("#postal-code").value.trim();
    let city = document.querySelector('#city').value;
    let CGU = document.querySelector('#CGU');
    const today = new Date();
    const selectedDate = new Date(date);

    let checkPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    let checkNom = /^.{2,}$/;
    let checkMail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    resetErrors();

    if (!prenom) {
        error("Le prénom est requis", 'firstname');
        return false;
    } else if (!checkNom.test(prenom)) {
        error("Le prénom doit contenir plus de 2 caractères", 'firstname');
        return false;
    }

    if (!nom) {
        error("Le nom est requis", 'lastname');
        return false;
    } else if (!checkNom.test(nom)) {
        error("Le nom doit contenir plus de 2 caractères", 'lastname');
        return false;
    }

    if (!email) {
        error("L'email est requis", "email");
        return false;
    } else if (!checkMail.test(email)) {
        error("L'email n'est pas valide", "email");
        return false;
    }

    if (!date) {
        error("La date est requise", "date");
        return false;
    } else if (selectedDate > today) {
        error("La date ne peut pas être postérieure à la date d'aujourd'hui", "date");
        return false;
    }

    if (!postalCode) {
        error("Le code postal est requis pour choisir une ville", "postal-code");
        return false;
    } else if (isNaN(postalCode)) {
        error("Code postal invalide", "postal-code");
        return false;
    }

    if (!city) {
        error("Ville obligatoire", "city");
        return false;
    }

    if (!CGU.checked) {
        error("Veuillez accepter les conditions générales d'utilisation pour continuer.", "CGU");
        return false;
    }

    // Vérifications des mots de passe (décommenter si nécessaire)
    // if (password !== password2) {
    //     error("Les deux mots de passe sont différents !", "confPassword");
    //     return false;
    // } else if (password.length < 8) {
    //     error("Le mot de passe choisi est trop court !", "password");
    //     return false;
    // } else if (!checkPassword.test(password)) {
    //     error("Le mot de passe choisi ne remplit pas les conditions de sécurité !", "password");
    //     return false;
    // }

    return true; // Retourne true si aucune erreur n'est trouvée
}


function resetErrors() {
    const errors = document.querySelectorAll(".error, .error-message");
    errors.forEach(message => message.remove());
}

function error(message, id) {
    const errorContainer = document.getElementById(id + "-error");
    if (!errorContainer) {
        console.error(`No error container found for id: ${id}`);
        return;
    }

    if (errorContainer.children.length > 0) {
        return; // Si un message d'erreur existe déjà, ne pas en ajouter un nouveau
    }

    let errorElement = document.createElement("span");
    errorElement.className = "error text-danger";
    errorElement.textContent = message;

    errorContainer.appendChild(errorElement);

    document.getElementById(id).focus();
}

