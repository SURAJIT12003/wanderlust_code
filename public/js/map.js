//for show map function ***
function showMap(lat, lng, city) {
  // Remove the previous map instance if it exists
  if (window.myMap) {
    window.myMap.remove();
  }

  // Create a new map instance
  window.myMap = L.map("map").setView([lat, lng], 10);

  // Add OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(window.myMap);

  // Add a marker for the given city
  L.marker([lat, lng])
    .addTo(window.myMap)
    .bindPopup(
      `${city}<br>Latitude: ${lat.toFixed(4)}, Longitude: ${lng.toFixed(4)}`
    )
    .openPopup();
}

// Function to initialize the map and data
function initializeListing() {
  // Ensure listing data is available
  if (typeof listing !== "undefined") {
    const lat = listing.geometry.coordinates[0];
    const lng = listing.geometry.coordinates[1];
    const city = listing.location;
    showMap(lat, lng, city);
  } 
}

// Call the initialize function to setup the listing
initializeListing();

