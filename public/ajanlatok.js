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
function bookFlight(flightId, totalPrice, guests, flightNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentUser = getCurrentUser();
        if (currentUser === null) {
            alert('Kérlek, először jelentkezz be!');
            window.location.href = './login.html';
            return;
        }
        const updatedUser = Object.assign(Object.assign({}, currentUser), { guests });
        if (!('bookings' in updatedUser)) {
            updatedUser.bookings = [];
        }
        updatedUser.bookings.push(flightId);
        try {
            const response = yield fetch(`http://localhost:3000/users/${updatedUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUser),
            });
            if (!response.ok)
                throw new Error('Failed to update user on server');
            let activeBookingIds = JSON.parse(localStorage.getItem('activeBookings') || '[]');
            activeBookingIds.push(flightId);
            localStorage.setItem('activeBookings', JSON.stringify(activeBookingIds));
            alert(`${flightNumber} járat foglalása sikeres!`);
        }
        catch (error) {
            console.error('Error updating user:', error);
            alert('Hiba történt a foglalás során.');
        }
    });
}
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}
function addSelectButtonListeners() {
    const selectButtons = document.querySelectorAll('.select-button');
    selectButtons.forEach(button => {
        button.replaceWith(button.cloneNode(true));
    });
    document.querySelectorAll('.select-button').forEach(button => {
        button.addEventListener('click', (e) => {
            var _a, _b, _c, _d;
            const flightCard = e.target.closest('.flight-card');
            if (flightCard) {
                const flightId = parseInt(((_a = flightCard.querySelector('.flight-info')) === null || _a === void 0 ? void 0 : _a.getAttribute('data-flight-id')) || '0');
                const totalPrice = parseInt(((_c = (_b = flightCard.querySelector('.total-price')) === null || _b === void 0 ? void 0 : _b.textContent) === null || _c === void 0 ? void 0 : _c.replace(/\D/g, '')) || '0');
                const flightNumber = ((_d = flightCard.querySelector('.flight-info')) === null || _d === void 0 ? void 0 : _d.getAttribute('flight.Flight_Number')) || 'Ismeretlen';
                const guestsInput = document.getElementById('guestsInput');
                const guests = parseInt((guestsInput === null || guestsInput === void 0 ? void 0 : guestsInput.value) || '1');
                bookFlight(flightId, totalPrice, guests, flightNumber);
            }
        });
    });
}
function addFlightIdsToCards() {
    const flightCards = document.querySelectorAll('.flight-card');
    flightCards.forEach(card => {
        var _a, _b, _c;
        const flightId = (_a = card.querySelector('.flight-info')) === null || _a === void 0 ? void 0 : _a.getAttribute('data-flight-id');
        if (!flightId) {
            const flightIdFromData = (_b = card.querySelector('.flight-info')) === null || _b === void 0 ? void 0 : _b.getAttribute('data-flight-id');
            if (flightIdFromData) {
                (_c = card.querySelector('.flight-info')) === null || _c === void 0 ? void 0 : _c.setAttribute('data-flight-id', flightIdFromData);
            }
        }
    });
}
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
                    <div class="flight-info" data-flight-id="${flight.id}">
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
            addSelectButtonListeners();
            addFlightIdsToCards();
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
                    <div class="flight-info" data-flight-id="${flight.id}">
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
            addSelectButtonListeners();
            addFlightIdsToCards();
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
