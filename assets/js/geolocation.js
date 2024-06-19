// Chargement initial de la page : récupération de la géolocalisation et recherche des événements correspondants
window.onload = async function () {
  const city = await getGeoLocation();
  console.log(city);
  if (city) {
    await searchByCity(city);
  }
};

// Fonction pour récupérer la géolocalisation de l'utilisateur
async function getGeoLocation() {
  try {
    if (!navigator.geolocation) {
      console.error(
        "La géolocalisation n'est pas supportée par ce navigateur."
      );
      throw new Error(
        "La géolocalisation n'est pas supportée par ce navigateur."
      );
    }
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    const { latitude, longitude } = position.coords;

    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`
    );
    const data = await response.json();
    return data.city || data.locality;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la géolocalisation:",
      error
    );
    return null;
  }
}

// Fonction pour rechercher les événements par ville
async function searchByCity(city) {
  try {
    const eventResponse = await fetch("/events/searchByCity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city: city }),
    });
    const events = await eventResponse.json();
    renderEvents(events, "eventsByLocationContainer");
  } catch (error) {
    console.error(
      "Erreur lors de la recherche des événements par ville:",
      error
    );
  }
}

// Fonction pour afficher les événements dans le tableau HTML
function renderEvents(events, containerId) {
  const eventsContainer = document.getElementById(containerId);
  if (events.length > 0) {
    let html =
      '<h3 class="text-center">Autour de moi :</h3><table><thead><tr><th>Event</th><th>Ville</th></tr></thead><tbody>';
    events.forEach((event) => {
      html += `<tr><td data-column="Event"><a href="/event/read/${event.id}" class="text-break">${event.event_name}</a></td><td data-column="lieux" class="text-break">${event.city}</td></tr>`;
    });
    html += "</tbody></table>";
    eventsContainer.innerHTML = html;
  } else {
    eventsContainer.innerHTML = "<p>Aucun événement trouvé.</p>";
  }
}
