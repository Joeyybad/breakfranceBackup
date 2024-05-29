function loginCheck() {
    // Récupération des données
    let email = document.querySelector("#email").value.trim();
    let password = document.querySelector("#password").value.trim();
   
    // Création des vérifications en format regex
    let checkPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;
    let checkMail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    resetErrors();
    
    
    // Vérifier si l'email existe
    if (!email) {
        error("Le mail est requis", "email");
        return false;
    } else if (!checkMail.test(email)) {
         // Vérifier si l'email est valide
         error("Le mail n'est pas valide", "email");
         return false;
    }
    
    // Vérifier si le mot de passe existe
    if (!password) {
        error("Le mot de passe est requis", "password");
        return false;
    } else if (!checkPassword.test(password)) {
        // Vérifier si le mot de passe respecte le format requis
        error("Le mot de passe doit comporter au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial", "password");
        return false;
    }

    // Vérifier si tous les champs sont remplis
    if (!email || !password) {
        return false;
    }

   
}

function resetErrors() {
    // Enlève les messages d'erreur précédents
    const errors = document.querySelectorAll(".error");
    errors.forEach(message => message.remove());
}

function error(message, id) {
    // Définit l'élément error
    let errorElement = document.createElement("span");
    errorElement.className = "error text-danger"; // Utilise une classe Bootstrap pour la couleur rouge
    errorElement.textContent = message;

    // Ajoute l'élément d'erreur dans le conteneur d'erreurs approprié
    let errorContainer = document.getElementById(id + "-error");
    errorContainer.appendChild(errorElement);
}