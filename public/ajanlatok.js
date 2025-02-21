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
        departureInputes === null || departureInputes === void 0 ? void 0 : departureInputes.addEventListener('change', (e) => {
            const selectedCity = e.target.value;
            const citiesTo = [...new Set(planes
                    .filter(flight => flight.Airport_From === selectedCity)
                    .map(flight => flight.Airport_To))];
            if (destinationInputes) {
                destinationInputes.innerHTML = '<option value="">Select Destination</option><option value="anywhere">Bárhova</option>';
                citiesTo.forEach(element => {
                    const option = document.createElement('option');
                    option.value = element;
                    option.innerText = element;
                    destinationInputes.appendChild(option);
                });
            }
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
            const title = document.getElementById('cheapest-flights-title');
            if (container && title) {
                container.innerHTML = '';
                container.className = 'flight-list';
                if (cheapestFlights.length > 0) {
                    title.style.display = 'block';
                }
                else {
                    title.style.display = 'none';
                }
                cheapestFlights.forEach(flight => {
                    const totalPrice = flight.Price * guests;
                    const card = document.createElement('div');
                    card.className = 'flight-card';
                    card.innerHTML = `
                    <div class="flight-info">
                        <img src="img/cities/${flight.Airport_To}.jpg" class="rounded me-3" alt="Airline Logo" width="150">
                        <div class="flight-time">
                            <strong>${flight.Departure_Time}:00</strong>
                            <span>${flight.Airport_From}</span>
                        </div>
                        <div class="flight-time">
                            ✈ ${flight.Flight_Number}
                            <span>${calculator(flight.Departure_Time.toString(), flight.Destination_Time.toString())} h</span>
                        </div>
                        <div class="flight-time">
                            <strong>${flight.Destination_Time}:00</strong>
                            <span>${flight.Airport_To}</span>
                        </div>
                    </div>
                    <div class="flight-price">
                        <div class="price-details">
                            <div class="price-per-person">Price per person: ${flight.Price} EUR</div>
                            <div class="total-price"><strong>Total price: ${totalPrice} EUR</strong></div>
                        </div>
                        <button class="select-button">Select</button>
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
            const popularFlights = filteredFlights
                .filter(flight => !cheapestFlightIds.includes(flight.id))
                .sort((a, b) => a.Free_seats - b.Free_seats)
                .slice(0, 4);
            const container = document.getElementById('popular-flights');
            const title = document.getElementById('popular-flights-title');
            if (container && title) {
                container.innerHTML = '';
                container.className = 'flight-list';
                if (popularFlights.length > 0) {
                    title.style.display = 'block';
                }
                else {
                    title.style.display = 'none';
                }
                popularFlights.forEach(flight => {
                    const totalPrice = flight.Price * guests;
                    const card = document.createElement('div');
                    card.className = 'flight-card';
                    card.innerHTML = `
                    <div class="flight-info">
                        <img src="img/cities/${flight.Airport_To}.jpg" class="rounded me-3" alt="Airline Logo" width="150">
                        <div class="flight-time">
                            <strong>${flight.Departure_Time}:00</strong>
                            <span>${flight.Airport_From}</span>
                        </div>
                        <div class="flight-time">
                            ✈ ${flight.Flight_Number}
                            <span>${calculator(flight.Departure_Time.toString(), flight.Destination_Time.toString())} h</span>
                        </div>
                        <div class="flight-time">
                            <strong>${flight.Destination_Time}:00</strong>
                            <span>${flight.Airport_To}</span>
                        </div>
                    </div>
                    <div class="flight-price">
                        <div class="price-details">
                            <div class="price-per-person">Price per person: ${flight.Price} EUR</div>
                            <div class="total-price"><strong>Total price: ${totalPrice} EUR</strong></div>
                        </div>
                        <button class="select-button">Select</button>
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
function calculator(a, b) {
    let time1 = a.split(':');
    let time2 = b.split(':');
    if (Number(time1[0]) > Number(time2[0])) {
        return 24 - Number(time1[0]) + Number(time2[0]);
    }
    else {
        return Number(time2[0]) - Number(time1[0]);
    }
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
