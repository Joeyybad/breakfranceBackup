function eventCheck() {
    // Récupération des valeurs des champs du formulaire
    const eventName = document.getElementById('eventName').value.trim();
    const eventDescription = document.getElementById('eventDescription').value.trim();
    const eventDate = document.getElementById('eventDate').value;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const eventTime = document.getElementById('eventTime').value.trim();
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    const registeredUser = document.getElementById('availablePlace').value;
    const city = document.getElementById('city').value.trim();
    const cityRegex = /^.{3,}$/;

    // Enlève les messages d'erreur précédents
    resetErrors();

    // Vérification du champ eventName
    if (!eventName) {
        error("Le nom de l'événement est requis", "eventName");
        return false;
    } else if (eventName.length < 2 || eventName.length > 20) {
        error("Le nom de l'événement doit comporter entre 2 et 20 caractères", "eventName");
        return false;
    }

    // Vérification du champ eventDescription
    if (!eventDescription) {
        error("La description de l'événement est requise", "eventDescription");
        return false;
    } else if (eventDescription.length < 10 || eventDescription.length > 200) {
        error("La description de l'événement doit être comprise entre 10 et 200 caractères", "eventDescription");
        return false;
    }

    // Vérification du champ eventDate
    if (!eventDate) {
        error("La date de l'événement est requise", "eventDate");
        return false;
    } else if (!dateRegex.test(eventDate)) {
        error("La date doit être valide", "eventDate");
        return false;
    }

    // Vérification du champ eventTime
    if (!eventTime) {
        error("L'heure de l'événement est requise", "eventTime");
        return false;
    } else if (!timeRegex.test(eventTime)) {
        error("L'heure doit être au format 24 heures", "eventTime");
        return false;
    }

    // Vérification du champ city
    if (!city) {
        error("Le lieu de l'événement est requis", "city");
        return false;
    } else if (!cityRegex.test(city)) {
        error("Le lieu de l'événement doit contenir au moins 3 caractères", "city");
        return false;
    }

    // Vérification du champ registeredUser
    if (!registeredUser) {
        error("Le nombre de joueurs est requis", "registeredUser");
        return false;
    } else if (isNaN(registeredUser) || registeredUser < 1 || registeredUser > 60) {
        error("Le nombre de joueurs doit être compris entre 1 et 60", "registeredUser");
        return false;
    }

    // Si aucune erreur, retour true
    return true;
}

function resetErrors() {
    // Enlève les messages d'erreur précédents
    const errors = document.querySelectorAll(".error");
    errors.forEach(message => message.remove());
}

function error(message, id) {
    // Définit l'élément error
    let errorElement = document.createElement("span");
    errorElement.className = "error text-danger";
    errorElement.textContent = message;

    // Définit le champ auquel error est rattaché
    let errorContainer = document.getElementById(id + "-error");
    errorContainer.appendChild(errorElement);

    // Mettre le focus sur l'élément avec l'erreur
    document.getElementById(id).focus();
}
