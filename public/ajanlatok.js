var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b;
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
        const citiesFrom = [...new Set(planes.map(x => x.Airport_From))];
        citiesFrom.forEach(element => {
            const option = document.createElement('option');
            option.value = element;
            option.innerText = element;
            departureInputes === null || departureInputes === void 0 ? void 0 : departureInputes.appendChild(option);
        });
        const citiesTo = [...new Set(planes.map(x => x.Airport_To))];
        citiesTo.forEach(element => {
            const option = document.createElement('option');
            option.value = element;
            option.innerText = element;
            destinationInputes === null || destinationInputes === void 0 ? void 0 : destinationInputes.appendChild(option);
        });
    });
}
let cheapestFlightIds = [];
function displayCheapestFlights(selectedCity, guests, destination, dateFrom) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const flights = yield fetchPlanes();
            let filteredFlights = flights.filter(flight => flight.Airport_From === selectedCity);
            if (!selectedCity || selectedCity === "") {
                filteredFlights = [];
            }
            else if (!destination || destination === "anywhere") {
                filteredFlights = flights.filter(flight => flight.Airport_From === selectedCity);
            }
            else {
                filteredFlights = flights.filter(flight => flight.Airport_From === selectedCity && flight.Airport_To === destination);
            }
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
                            <p><strong>Total price: ${totalPrice} EUR</strong></p>
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
function displayPopularFlights(selectedCity, guests, destination, dateFrom) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const flights = yield fetchPlanes();
            let filteredFlights = flights.filter(flight => flight.Airport_From === selectedCity);
            if (!selectedCity || selectedCity === "") {
                // Ha nincs kiválasztva indulási hely, ne mutasson semmit
                filteredFlights = [];
            }
            else if (!destination || destination === "anywhere") {
                // Ha a célállomás "Bárhova", akkor minden járatot megjelenít az adott indulási helyről
                filteredFlights = flights.filter(flight => flight.Airport_From === selectedCity);
            }
            else {
                // Egyébként normál célállomás szerint szűrünk
                filteredFlights = flights.filter(flight => flight.Airport_From === selectedCity && flight.Airport_To === destination);
            }
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
                            <p><strong>Total price: ${totalPrice} EUR</strong></p>
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
    const destination = destinationSelect.value;
    const guests = parseInt(guestsInput.value);
    const dateFrom = dateFromInput.value || undefined;
    displayCheapestFlights(selectedCity, guests, destination, dateFrom);
    displayPopularFlights(selectedCity, guests, destination, dateFrom);
}));
(_b = document.getElementById('flightSearchForm')) === null || _b === void 0 ? void 0 : _b.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const departureSelect = document.getElementById('departureDropDownMenuInput');
    const destinationSelect = document.getElementById('destinationDropDownMenuInput');
    const guestsInput = document.getElementById('guestsInput');
    const dateFromInput = document.getElementById('dateFromInput');
    const selectedCity = departureSelect.value;
    const guests = parseInt(guestsInput.value);
    const dateFrom = dateFromInput.value || undefined;
    if (destinationSelect.value === "anywhere" || destinationSelect.value === "") {
        displayCheapestFlights(selectedCity, guests, undefined, dateFrom);
        displayPopularFlights(selectedCity, guests, undefined, dateFrom);
    }
    else {
        displayCheapestFlights(selectedCity, guests, destinationSelect.value, dateFrom);
        displayPopularFlights(selectedCity, guests, destinationSelect.value, dateFrom);
    }
}));
document.addEventListener('DOMContentLoaded', () => {
    displayPlanes();
});
