function groupCheck() {
  // Récupération des valeurs des champs du formulaire
  const groupName = document.getElementById("groupName").value.trim();
  const groupDescription = document
    .getElementById("groupDescription")
    .value.trim();
  const groupCity = document.getElementById("city").value;
  const imgGroup = document.getElementById("imgGroup").value.trim();

  const cityRegex = /^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$/;

  resetErrors();

  // Vérification du champ groupName
  if (!groupName) {
    error("Le nom du groupe est requis", "groupName");
    return false;
  } else if (groupName.length < 2 || groupName.length > 50) {
    error(
      "Le nom du groupe doit comporter entre 2 et 50 caractères",
      "groupName"
    );
    return false;
  }

  // Vérification du champ groupDescription
  if (!groupDescription) {
    error("La description du groupe est requise", "groupDescription");
    return false;
  } else if (groupDescription.length < 10 || groupDescription.length > 200) {
    error(
      "La description du groupe doit être comprise entre 10 et 200 caractères",
      "groupDescription"
    );
    return false;
  }

  // Vérification du champ groupCity
  if (!groupCity) {
    error("Le nom de la ville est requis", "city");
    return false;
  } else if (!cityRegex.test(groupCity)) {
    error("Le nom de la ville est incorrect", "city");
    return false;
  }

  // Vérification du champ imgGroup
  if (!imgGroup) {
    error("L'Url de l'image est requise", "imgGroup");
    return false;
    // Toutes les validations ont réussi, donc on retourne true
    return true;
  }
}

function resetErrors() {
  // Enlève les messages d'erreur précédents
  const errors = document.querySelectorAll(".error");
  errors.forEach((message) => message.remove());
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
