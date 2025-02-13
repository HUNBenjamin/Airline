import * as Leaflet from "leaflet";
const L = window.L as typeof Leaflet;


// Initialize the map
const map = L.map("map").setView([47.3769, 8.5417], 5); // Center on Europe
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Custom plane icon
const planeIcon = L.icon({
  iconUrl: "../img/flightRadarPlaneIcon.png", // Replace with your plane image
  iconSize: [32, 32], // Adjust as needed
  iconAnchor: [16, 16],
});

// Sample flight data
const flights = [
  {
    id: "1",
    Departure_Coordinates: { lat: 47.3769, lng: 8.5417 }, // Zurich
    Destination_Coordinates: { lat: 50.0379, lng: 8.5622 }, // Frankfurt
    Departure_DateTime: "2025-06-12T16:00:00Z",
    Destination_DateTime: "2025-06-12T19:00:00Z",
    Flight_Number: "SKY476",
    Plane_Type: "Boeing 787",
  },
];

// Calculate the position of the plane based on the percentage of the flight completed
function calculatePosition(
    departure: [number, number],
    destination: [number, number],
    progress: number
  ): [number, number] {
    const lat = (1 - progress) * departure[0] + progress * destination[0];
    const lng = (1 - progress) * departure[1] + progress * destination[1];
    return [lat, lng];
  }
  

// Update planes on the map
function updatePlanes() {
  const now = new Date().getTime();

  flights.forEach((flight) => {
    const departureTime = new Date(flight.Departure_DateTime).getTime();
    const arrivalTime = new Date(flight.Destination_DateTime).getTime();
    const flightDuration = arrivalTime - departureTime;
    const elapsedTime = now - departureTime;

    if (elapsedTime >= 0 && elapsedTime <= flightDuration) {
      // Calculate the progress of the flight
      const progress = elapsedTime / flightDuration;

      // Calculate current position
      const currentPosition = calculatePosition(
        [flight.Departure_Coordinates.lat, flight.Departure_Coordinates.lng] as [number, number],
        [flight.Destination_Coordinates.lat, flight.Destination_Coordinates.lng] as [number, number],
        progress
      );

      // Move the plane
      const plane = planes[flight.id];
      if (plane) {
        plane.setLatLng(currentPosition);
      }
    }
  });
}

// Add flights to the map
const planes: { [id: string]: L.Marker } = {};
flights.forEach((flight) => {
  // Add flight path
  const flightPath = L.polyline(
    [
      [flight.Departure_Coordinates.lat, flight.Departure_Coordinates.lng],
      [flight.Destination_Coordinates.lat, flight.Destination_Coordinates.lng],
    ],
    { color: "blue", weight: 2 }
  ).addTo(map);

  // Add plane marker
  const planeMarker = L.marker(
    [flight.Departure_Coordinates.lat, flight.Departure_Coordinates.lng],
    { icon: planeIcon }
  )
    .addTo(map)
    .on("click", () => {
      // Show flight info on click
      planeMarker
        .bindPopup(
          `<b>Flight Number:</b> ${flight.Flight_Number}<br>
           <b>Plane Type:</b> ${flight.Plane_Type}<br>
           <b>Departure:</b> Zurich<br>
           <b>Destination:</b> Frankfurt<br>`
        )
        .openPopup();

      // Highlight the flight path
      flightPath.setStyle({ color: "red", weight: 3 });
    });

  planes[flight.id] = planeMarker;
});

// Periodically update the planes' positions
setInterval(updatePlanes, 1000);
