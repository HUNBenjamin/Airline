interface Flight {
    id: string;
    Departure_Date: string;
    Departure_Time: string;
    Destination_Date: string;
    Destination_Time: string;
    Airport_From: string;
    Airport_To: string;
    Price: number;
    Plane_Type: string;
    Free_Seats: number;
    Flight_Number: string;
    Image?: string;
}

interface Hotel {
    id: string;
    name: string;
    city: string;
    pricePerNight: number;
    maxGuests: number;
    amenities: string[];
    rating: number;
    availableFrom: string;
    availableTo: string;
    image?: string;
}

interface AirportCoordinate {
    name: string;
    lat: number;
    lng: number;
    id: string;
    image?: string; // Új mező a város képéhez
}

let map: L.Map;
let selectedDeparture: string = ""; // Alapértelmezett indulási repülőtér
let selectedMonth: string = new Date().toISOString().slice(5, 7); // Az aktuális hónap

document.addEventListener("DOMContentLoaded", () => {
    const departureSelect = document.getElementById("departure-select") as HTMLSelectElement;
    const monthSelect = document.getElementById("month-select") as HTMLSelectElement;

    if (!departureSelect || !monthSelect) {
        console.error("Nem található a választó elem!");
        return;
    }

    // Betöltjük a repülőtereket
    fetchAirportCoordinates().then(coordinates => {
        coordinates.forEach(coord => {
            const option = document.createElement("option");
            option.value = coord.name;
            option.textContent = coord.name;
            departureSelect.appendChild(option);
        });

        // Beállítjuk az alapértelmezett indulási repülőteret
        selectedDeparture = coordinates[0].name;
        departureSelect.value = selectedDeparture;
    });

    // Beállítjuk az aktuális hónapot
    monthSelect.value = selectedMonth;

    // Kezdeti térkép betöltése
    initializeMap();

    // Hónap és indulási repülőtér változás figyelése
    departureSelect.addEventListener("change", (event) => {
        selectedDeparture = (event.target as HTMLSelectElement).value;
        initializeMap();
    });

    monthSelect.addEventListener("change", (event) => {
        selectedMonth = (event.target as HTMLSelectElement).value.padStart(2, "0");
        initializeMap();
    });
});

async function fetchPlanes(): Promise<Flight[]> {
    try {
        const response = await fetch("http://localhost:3000/userFlights");
        if (!response.ok) {
            throw new Error("Failed to fetch planes");
        }
        return response.json();
    } catch (error) {
        console.error("Error fetching planes:", error);
        return [];
    }
}

async function fetchHotels(): Promise<Hotel[]> {
    try {
        const response = await fetch("http://localhost:3000/hotels");
        if (!response.ok) {
            throw new Error("Failed to fetch hotels");
        }
        return response.json();
    } catch (error) {
        console.error("Error fetching hotels:", error);
        return [];
    }
}

async function fetchAirportCoordinates(): Promise<AirportCoordinate[]> {
    try {
        const response = await fetch("http://localhost:3000/airportCoordinates");
        if (!response.ok) {
            throw new Error("Failed to fetch airport coordinates");
        }
        return response.json();
    } catch (error) {
        console.error("Error fetching airport coordinates:", error);
        return [];
    }
}

async function initializeMap() {
    const coordinates = await fetchAirportCoordinates();
    const flights = await fetchPlanes();
    const hotels = await fetchHotels();

    if (!coordinates || coordinates.length === 0) {
        console.error("No valid coordinates found.");
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.innerHTML = `<div style="text-align: center; padding: 20px; color: red;">Hiba: Nem sikerült betölteni a városok adatait.</div>`;
        }
        return;
    }

    // Térkép inicializálása
    if (map) {
        map.remove(); // Eltávolítjuk a régi térképet, ha már létezik
    }
    map = L.map('map').setView([47.4979, 19.0402], 5); // Kezdeti középpont Budapest

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    coordinates.forEach(coord => {
        const marker = L.marker([coord.lat, coord.lng]).addTo(map);

        // Szűrés a kiválasztott indulási repülőtérre és hónapra
        const cityFlights = flights
            .filter((flight: Flight) => {
                const flightMonth = flight.Departure_Date.split('-')[1]; // YYYY-MM-DD formátumból kivesszük a hónapot
                return (
                    flight.Airport_From === selectedDeparture &&
                    flight.Airport_To === coord.name &&
                    flightMonth === selectedMonth && // Csak a kiválasztott hónapban induló járatok
                    flight.Free_Seats >= 1 // Legalább 1 szabad hely
                );
            })
            .sort((a, b) => a.Price - b.Price) // Ár szerinti növekvő sorrend
            .slice(0, 5); // Az 5 legolcsóbb járat

        const cityHotels = hotels.filter((hotel: Hotel) => hotel.city === coord.name);

        // Kép elérési útja
        const cityImagePath = `img/cities/${coord.name.toLowerCase()}.jpg`;

        // Popup tartalom létrehozása
        let popupContent = `
            <div class="popup-container">
                <div class="popup-image-container">
                    <img src="${cityImagePath}" alt="${coord.name}" class="popup-image">
                </div>
                <div class="popup-hotels">
                    <h4>Szállások</h4>
        `;

        if (cityHotels.length === 0) {
            popupContent += `<p>Nincsenek elérhető szállások.</p>`;
        } else {
            cityHotels.slice(0, 5).forEach((hotel: Hotel) => {
                if (!hotel.id || !hotel.name) {
                    console.error("Invalid hotel data:", hotel);
                    return;
                }
                popupContent += `
                    <div class="hotel-item">
                        <a href="hotelek.html?selectedCity=${encodeURIComponent(coord.name)}" target="_blank">
                            ${hotel.name}
                        </a>
                    </div>
                `;
            });
        }

        popupContent += `</div><div class="popup-flights"><h4>Repülőjáratok</h4>`;

        if (cityFlights.length === 0) {
            popupContent += `<p>Nincsenek elérhető repülőjáratok ebben a hónapban.</p>`;
        } else {
            cityFlights.forEach((flight: Flight) => {
                const departureDay = flight.Departure_Date.split('-')[2]; // YYYY-MM-DD formátumból kivesszük a napot
                popupContent += `
                    <div class="flight-item">
                        <a href="reservation.html?departureDate=${flight.Departure_Date}&departureTime=${flight.Departure_Time}&destinationDate=${flight.Destination_Date}&destinationTime=${flight.Destination_Time}&airportFrom=${flight.Airport_From}&airportTo=${flight.Airport_To}&price=${flight.Price}&typeOfPlane=${flight.Plane_Type}&freeSeats=${flight.Free_Seats}&flightNumber=${flight.Flight_Number}&passangers=1&departureAirport=${flight.Airport_From}&destinationAirport=${flight.Airport_To}" target="_blank">
                            ${flight.Flight_Number} - ${flight.Price} EUR (Indulás: ${departureDay}. nap)
                        </a>
                    </div>
                `;
            });
        }

        popupContent += `</div></div>`; // Popup tartalom lezárása

        // Popup hozzáadása a markerhez
        marker.bindPopup(popupContent);

        // Kattintás esemény kezelése
        marker.on('click', () => {
            marker.openPopup();
        });
    });
}