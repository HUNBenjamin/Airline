var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
export function fetchPlanes() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("http://localhost:3000/userFlights");
        if (!response.ok) {
            throw new Error("Failed to fetch planes");
        }
        const data = yield response.json();
        return data;
    });
}
export function displayPlanes() {
    return __awaiter(this, void 0, void 0, function* () {
        const planes = yield fetchPlanes();
        const departureInputes = document.getElementById('departureDropDownMenuInput');
        const destinationInputes = document.getElementById('destinationDropDownMenuInput');
        const citiesFrom = [...new Set(planes.map(x => x.Airport_From))]; // Egyedi indulási városok
        // Indulási városok feltöltése
        citiesFrom.forEach(element => {
            const option = document.createElement('option');
            option.value = element;
            option.innerText = element;
            departureInputes === null || departureInputes === void 0 ? void 0 : departureInputes.appendChild(option);
        });
        // Célállomások feltöltése (kivéve "Bárhova")
        const citiesTo = [...new Set(planes.map(x => x.Airport_To))]; // Egyedi célállomások
        citiesTo.forEach(element => {
            const option = document.createElement('option');
            option.value = element;
            option.innerText = element;
            destinationInputes === null || destinationInputes === void 0 ? void 0 : destinationInputes.appendChild(option);
        });
    });
}
let cheapestFlightIds = [];
function displayCheapestFlights(selectedCity, guests, dateFrom) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const flights = yield fetchPlanes();
            let filteredFlights = flights.filter(flight => flight.Airport_From === selectedCity);
            // Dátum szűrés, ha meg van adva
            if (dateFrom) {
                filteredFlights = filteredFlights.filter(flight => flight.Departure_Date === dateFrom);
            }
            const cheapestFlights = filteredFlights
                .sort((a, b) => a.Price - b.Price)
                .slice(0, 4);
            cheapestFlightIds = cheapestFlights.map(flight => flight.id);
            const container = document.getElementById('cheapest-flights');
            if (container) {
                container.innerHTML = '';
                container.className = 'flight-list';
                cheapestFlights.forEach(flight => {
                    const totalPrice = flight.Price * guests;
                    const card = document.createElement('div');
                    card.className = 'flight-card';
                    card.innerHTML = `
                    <div class="flight-card-left">
                        <img src="img/cities/${flight.Airport_To}.jpg" alt="${flight.Airport_To}" class="flight-image">
                    </div>
                    <div class="flight-card-middle">
                        <div class="flight-header">
                            <h3>${flight.Airport_From} → ${flight.Airport_To}</h3>
                        </div>
                        <div class="seats">
                            <p>Date: ${flight.Departure_Date}</p>
                            <p>Time: ${flight.Departure_Time}:00</p>
                            <p>Price per person: ${flight.Price} EUR</p>
                            <p>Total price: ${totalPrice} EUR</p>
                        </div>
                    </div>
                    <div class="flight-card-right">
                        <button class="book-flight-btn" onclick="bookFlight(${flight.id})">Book Now</button>
                    </div>
                `;
                    container.appendChild(card);
                });
            }
        }
        catch (error) {
            console.error('Error displaying cheapest flights:', error);
        }
    });
}
function displayPopularFlights(selectedCity, guests, dateFrom) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const flights = yield fetchPlanes();
            let filteredFlights = flights.filter(flight => flight.Airport_From === selectedCity);
            // Dátum szűrés, ha meg van adva
            if (dateFrom) {
                filteredFlights = filteredFlights.filter(flight => flight.Departure_Date === dateFrom);
            }
            const popularFlights = filteredFlights
                .filter(flight => !cheapestFlightIds.includes(flight.id))
                .sort((a, b) => a.Free_seats - b.Free_seats)
                .slice(0, 4);
            const container = document.getElementById('popular-flights');
            if (container) {
                container.innerHTML = '';
                container.className = 'flight-list';
                popularFlights.forEach(flight => {
                    const totalPrice = flight.Price * guests;
                    const card = document.createElement('div');
                    card.className = 'flight-card';
                    card.innerHTML = `
                    <div class="flight-card-left">
                        <img src="img/cities/${flight.Airport_To}.jpg" alt="${flight.Airport_To}" class="flight-image">
                    </div>
                    <div class="flight-card-middle">
                        <div class="flight-header">
                            <h3>${flight.Airport_From} → ${flight.Airport_To}</h3>
                        </div>
                        <div class="seats">
                            <p>Date: ${flight.Departure_Date}</p>
                            <p>Time: ${flight.Departure_Time}:00</p>
                            <p>Price per person: ${flight.Price} EUR</p>
                            <p>Total price: ${totalPrice} EUR</p>
                        </div>
                    </div>
                    <div class="flight-card-right">
                        <button class="book-flight-btn" onclick="bookFlight(${flight.id})">Book Now</button>
                    </div>
                `;
                    container.appendChild(card);
                });
            }
            if (popularFlights.length === 0) {
                const noFlightsMessage = document.createElement('div');
                noFlightsMessage.className = 'no-flights';
                noFlightsMessage.innerHTML = `<h3>No popular flights available from ${selectedCity}</h3>`;
                container === null || container === void 0 ? void 0 : container.appendChild(noFlightsMessage);
            }
        }
        catch (error) {
            console.error('Error displaying popular flights:', error);
        }
    });
}
(_a = document.getElementById('flightSearchForm')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const departureSelect = document.getElementById('departureDropDownMenuInput');
    const destinationSelect = document.getElementById('destinationDropDownMenuInput');
    const guestsInput = document.getElementById('guestsInput');
    const dateFromInput = document.getElementById('dateFromInput');
    const selectedCity = departureSelect.value;
    const guests = parseInt(guestsInput.value);
    const dateFrom = dateFromInput.value || undefined; // Dátum opcionális
    if (destinationSelect.value === "anywhere") {
        // Ha "Bárhova" van kiválasztva, akkor minden célállomásra mutatjuk a repjegyeket
        displayCheapestFlights(selectedCity, guests, dateFrom);
        displayPopularFlights(selectedCity, guests, dateFrom);
    }
    else {
        // Ha konkrét célállomás van kiválasztva, akkor csak azokat mutatjuk
        displayCheapestFlights(selectedCity, guests, dateFrom);
        displayPopularFlights(selectedCity, guests, dateFrom);
    }
}));
document.addEventListener('DOMContentLoaded', () => {
    displayPlanes();
});
