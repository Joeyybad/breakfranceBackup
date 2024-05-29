// Fonction pour effectuer la requête API et mettre à jour la liste déroulante des villes
async function updateCityList(postalCodeInput, citySelect) {
    const postalCode = postalCodeInput.value;
    // Vérifier si le code postal est vide
    if (postalCode.trim() === "") {
        // Si le code postal est vide, réinitialiser la liste des villes
        citySelect.innerHTML = '<option value="">Choisissez une ville</option>';
        return;
    }
    // Effectuer la requête API vers l'API gouvernementale des codes postaux
    try {
        const response = await fetch(`https://apicarto.ign.fr/api/codes-postaux/communes/${postalCode}`);
        const data = await response.json();
        console.log(data)
        // Mettre à jour la liste déroulante des villes
        if (data.length > 0) {
            const cityOptions = data.map(city => `<option value="${city.nomCommune}">${city.nomCommune}</option>`).join('');
            citySelect.innerHTML = cityOptions;
        } else {
            citySelect.innerHTML = '<option value="">Aucune ville trouvée</option>';
        }
    } catch (error) {
        console.error("Erreur lors de la requête API :", error);
        citySelect.innerHTML = '<option value="">Erreur lors de la récupération des villes</option>';
    }
}

// Fonction pour initialiser les gestionnaires d'événements code postal
function initializeEventHandlers() {
    const postalCodeInput = document.getElementById('postal-code');
    const citySelect = document.getElementById('city');
    // Ajouter un gestionnaire d'événement pour le changement de code postal
    postalCodeInput.addEventListener('input', () => {
        updateCityList(postalCodeInput, citySelect);
    });
}