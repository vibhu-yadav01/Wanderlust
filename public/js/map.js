const latlng = [coordinates[1], coordinates[0]];

// Initialize map centered on this location
const map = L.map('map').setView(latlng, 9);

// Add OSM tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Add marker
L.marker(latlng, { icon: L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', iconSize: [30, 30] }) })
  .addTo(map)
  .bindPopup(`<b>${listingName}</b><p>${locationName}</p>`)   // popup content
  .openPopup();   // optional: auto-open on load

const circle = L.circle(latlng, {
  radius: 25000,          // in meters
  color: "blue",        // outline color
  fillColor:"lightblue", // inside color
  fillOpacity: 0.5      // transparency
}).addTo(map);
