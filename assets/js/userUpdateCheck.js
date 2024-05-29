document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('updateForm')) {
        const form = document.getElementById('updateForm');
        form.addEventListener('submit', function (event) {
            if (!userUpdateCheck()) {
                event.preventDefault(); // Empêche l'envoi du formulaire si des erreurs sont présentes
            }
        });
    }
});

function userUpdateCheck() {
    let prenom = document.querySelector("#editFirstname").value.trim();
    let nom = document.querySelector("#editLastname").value.trim();
    let email = document.querySelector("#editEmail").value.trim();
    let oldPassword = document.querySelector("#oldPassword").value.trim();
    let newPassword = document.querySelector("#newPassword").value.trim(); // Corrigé ici
    let confNewPassword = document.querySelector("#confPassword").value.trim();
    let editCity = document.querySelector("#editCity").value.trim();

    let checkPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;
    let checkNom = /^.{2,}$/;
    let checkMail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    resetErrors();

    if (!checkNom.test(prenom)) {
        errorUpdate("Le prénom n'est pas valide !", "editFirstname");
        return false;
    } else if (!checkNom.test(nom)) {
        errorUpdate("Le nom n'est pas valide !", "editLastname");
        return false;
    } else if (!checkMail.test(email)) {
        errorUpdate("L'adresse mail n'est pas valide !", "editEmail");
        return false;
    }

    if (!editCity) {
        errorUpdate("Ville obligatoire", "editCity");
        return false;
    }

    if (oldPassword || newPassword || confNewPassword) {
        if (!oldPassword) {
            errorUpdate("L'ancien mot de passe est requis !", "oldPassword");
            return false;
        }
        if (newPassword.length < 6) {
            errorUpdate("Le nouveau mot de passe est trop court !", "newPassword"); // Corrigé ici
            return false;
        } else if (!checkPassword.test(newPassword)) {
            errorUpdate("Le nouveau mot de passe ne remplit pas les conditions de sécurité !", "newPassword"); // Corrigé ici
            return false;
        } else if (newPassword !== confNewPassword) {
            errorUpdate("Les nouveaux mots de passe ne correspondent pas !", "confPassword");
            return false;
        }
    }

    console.log("Validation réussie");
    return true;
}

function errorUpdate(message, elementId) {
    let errorElement = document.createElement("span");
    errorElement.className = "error text-danger";
    errorElement.textContent = message;

    let errorContainer = document.getElementById("error-container");
    errorContainer.appendChild(errorElement);
}

function resetErrors() {
    const errorContainer = document.getElementById("error-container");
    if (errorContainer) {
        errorContainer.innerHTML = "";
    }
}