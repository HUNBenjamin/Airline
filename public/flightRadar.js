var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const L = window.L;
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
const airportCoordinates = [
    {
        name: "Zurich",
        lat: 47.4592,
        lng: 8.5512,
    },
    {
        name: "Frankfurt",
        lat: 50.0379,
        lng: 8.5622,
    },
    {
        name: "Helsinki",
        lat: 60.3176,
        lng: 24.9500,
    },
    {
        name: "Copenhagen",
        lat: 55.6203,
        lng: 12.6493,
    },
    {
        name: "Edinburgh",
        lat: 55.9514,
        lng: -3.3679,
    },
    {
        name: "Singapore",
        lat: 1.3585,
        lng: 103.9815,
    },
    {
        name: "Berlin",
        lat: 52.3545,
        lng: 13.5074,
    },
    {
        name: "London",
        lat: 51.4651,
        lng: -0.4569,
    },
    {
        name: "San Francisco",
        lat: 37.6235,
        lng: -122.3815,
    },
    {
        name: "Vienna",
        lat: 48.1104,
        lng: 16.5721,
    },
    {
        name: "Lisbon",
        lat: 38.7681,
        lng: -9.1429,
    },
    {
        name: "Bangkok",
        lat: 13.6986,
        lng: 100.7419,
    },
    {
        name: "New York",
        lat: 40.6291,
        lng: -73.7750,
    },
    {
        name: "Prague",
        lat: 50.1176,
        lng: 14.5326,
    },
    {
        name: "Sydney",
        lat: -33.9306,
        lng: 151.1718,
    },
    {
        name: "Dubai",
        lat: 25.2662,
        lng: 55.3473,
    },
    {
        name: "Rome",
        lat: 41.8009,
        lng: 12.2372,
    },
    {
        name: "Amsterdam",
        lat: 52.3167,
        lng: 4.7500,
    },
    {
        name: "Paris",
        lat: 48.9956,
        lng: 2.5538,
    },
    {
        name: "Munich",
        lat: 48.3629,
        lng: 11.7696,
    },
    {
        name: "Budapest",
        lat: 47.4441,
        lng: 19.2597,
    },
    {
        name: "Melbourne",
        lat: -37.6557,
        lng: 144.8353,
    },
    {
        name: "Delhi",
        lat: 28.5468,
        lng: 77.0664,
    },
    {
        name: "Tokyo",
        lat: 35.5496,
        lng: 139.7615,
    },
    {
        name: "Madrid",
        lat: 40.4843,
        lng: -3.5754,
    },
    {
        name: "Chicago",
        lat: 41.9884,
        lng: -87.9303,
    },
    {
        name: "Oslo",
        lat: 60.1875,
        lng: 11.0751,
    },
    {
        name: "Stockholm",
        lat: 59.6652,
        lng: 17.9232,
    }
];
function getAirportCoordinates(airportName) {
    const airport = airportCoordinates.find(coord => coord.name === airportName);
    return airport ? { lat: airport.lat, lng: airport.lng } : null;
}
function fetchFlightsForTracker() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("http://localhost:3000/userFlights");
            if (!response.ok)
                throw new Error('Failed to fetch user flights');
            return yield response.json();
        }
        catch (error) {
            console.error('Error fetching flights:', error);
            return [];
        }
    });
}
function initializeMap() {
    return __awaiter(this, void 0, void 0, function* () {
        const flights = yield fetchFlightsForTracker();
        const planes = {};
        flights.forEach((flight) => {
            const departureCoords = getAirportCoordinates(flight.Airport_From);
            const destinationCoords = getAirportCoordinates(flight.Airport_To);
            if (!departureCoords || !destinationCoords)
                return;
            const flightPath = L.polyline([
                [departureCoords.lat, departureCoords.lng],
                [destinationCoords.lat, destinationCoords.lng],
            ], { color: "blue", weight: 2 }).addTo(map);
            const planeMarker = L.marker([departureCoords.lat, departureCoords.lng], { icon: planeIcon })
                .addTo(map)
                .on("click", () => {
                planeMarker
                    .bindPopup(`<b>Flight Number:</b> ${flight.Flight_Number}<br>
             <b>Plane Type:</b> ${flight.Type_of_plane}<br>
             <b>Departure:</b> ${flight.Airport_From}<br>
             <b>Destination:</b> ${flight.Airport_To}<br>
             <b>Price:</b> ${flight.Price}<br>
             <b>Available Seats:</b> ${flight.Free_seats}`)
                    .openPopup();
                flightPath.setStyle({ color: "red", weight: 3 });
            });
            planes[flight.id] = planeMarker;
        });
    });
}
// Sample flight data
const flights = [
    {
        id: "1",
        Departure_Coordinates: { lat: airportCoordinates[0].lat, lng: airportCoordinates[0].lng }, // Zurich
        Destination_Coordinates: { lat: airportCoordinates[1].lat, lng: airportCoordinates[1].lng }, // Frankfurt
        Departure_DateTime: "2025-06-12T16:00:00Z",
        Destination_DateTime: "2025-06-12T19:00:00Z",
        Flight_Number: "SKY476",
        Plane_Type: "Boeing 787",
    },
];
initializeMap();
export {};
