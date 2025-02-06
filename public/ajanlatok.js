"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _c, _d;
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator.throw(value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b;
;
function fetchPlanes() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("http://localhost:3000/userFlights");
        if (!response.ok) {
            throw new Error("Failed to fetch planes");
        }
        const data = yield response.json();
        return data;
    });
}
let cheapestFlightIds = [];
function displayCheapestFlights(selectedCity) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const flights = yield fetchPlanes();
            const cheapestFlights = flights
                .filter(flight => flight.Airport_From === selectedCity)
                .sort((a, b) => a.Price - b.Price)
                .slice(0, 4);
            // Store the IDs of cheapest flights
            cheapestFlightIds = cheapestFlights.map(flight => flight.id);
            const container = document.getElementById('cheapest-flights');
            if (container) {
                container.innerHTML = '';
                cheapestFlights.forEach(flight => {
                    const card = document.createElement('div');
                    card.className = 'flight-card';
                    card.innerHTML = `
                    <h2>${flight.Airport_From} → ${flight.Airport_To}</h2>
                    <p>Date: ${flight.Departure_Date}</p>
                    <p>Time: ${flight.Departure_Time}:00</p>
                    <p class="price">Price: ${flight.Price} EUR</p>
                    <button onclick="bookFlight(${flight.id})">Book Now</button>
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
function displayNoFlightsMessage(selectedCity) {
    const popularFlightsDiv = document.getElementById('popular-flights');
    if (popularFlightsDiv && selectedCity !== 'Departure') {
        popularFlightsDiv.innerHTML = `
            <div style="
                text-align: center;
                width: 100%;
                background-color: rgba(255, 255, 255, 0.8);
                padding: 15px;
                border-radius: 8px;
            ">
                <span style="
                    color: red;
                    font-weight: bold;
                ">
                    Nincs több megjeleníthető repjegy a választott ${selectedCity} indulási helyről
                </span>
            </div>
        `;
    }
    else if (popularFlightsDiv) {
        popularFlightsDiv.innerHTML = '';
    }
}
function displayPopularFlights(selectedCity) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const flights = yield fetchPlanes();
            const popularFlights = flights
                .filter(flight => flight.Airport_From === selectedCity &&
                !cheapestFlightIds.includes(flight.id))
                .sort((a, b) => a.Free_seats - b.Free_seats)
                .slice(0, 4);
            const container = document.getElementById('popular-flights');
            if (container) {
                container.innerHTML = '';
                container.style.display = 'flex';
                container.style.flexDirection = 'row';
                container.style.justifyContent = 'space-between';
                container.style.gap = '20px';
                container.style.padding = '20px';
                popularFlights.forEach(flight => {
                    const card = document.createElement('div');
                    card.className = 'flight-card';
                    card.style.flex = '1';
                    card.style.minWidth = '250px';
                    card.style.maxWidth = '300px';
                    card.innerHTML = `
                    <h2>${flight.Airport_From} → ${flight.Airport_To}</h2>
                    <p>Date: ${flight.Departure_Date}</p>
                    <p>Time: ${flight.Departure_Time}:00</p>
                    <p class="price">Price: ${flight.Price} EUR</p>
                    <p>Free seats: ${flight.Free_seats}</p>
                    <button onclick="bookFlight(${flight.id})">Book Now</button>
                `;
                    container.appendChild(card);
                });
            }
            if (popularFlights.length === 0) {
                displayNoFlightsMessage(selectedCity);
            }
        }
        catch (error) {
            console.error('Error displaying popular flights:', error);
        }
    });
}
(_c = document.getElementById('departureDropDownMenuInput')) === null || _c === void 0 ? void 0 : _c.addEventListener("change", (event) => __awaiter(void 0, void 0, void 0, function* () {
    const target = event.target;
    const selectedCity = target.value;
    // Update both displays when city changes
    displayCheapestFlights(selectedCity);
    displayPopularFlights(selectedCity);
    // Update destination dropdown
    let destinationInputes = document.getElementById('destinationDropDownMenuInput');
    if (destinationInputes) {
        destinationInputes.innerHTML = ''; // Clear existing options
        const planes = yield fetchPlanes();
        let availableDestinations = planes
            .filter(x => x.Airport_From === selectedCity)
            .forEach(element => {
            const option = document.createElement('option');
            option.value = element.Airport_To;
            option.innerText = element.Airport_To;
            destinationInputes === null || destinationInputes === void 0 ? void 0 : destinationInputes.appendChild(option);
        });
    }
}));
function displayPlanes() {
    return __awaiter(this, void 0, void 0, function* () {
        const plane = yield fetchPlanes();
        let BigPlanes = plane;
        let citiesFrom = plane.map(x => x.Airport_From);
        let departureInputes = document.getElementById('departureDropDownMenuInput');
        citiesFrom.forEach(element => {
            const option = document.createElement('option');
            option.value = `${element}`;
            option.innerText = `${element}`;
            departureInputes === null || departureInputes === void 0 ? void 0 : departureInputes.appendChild(option);
        });
    });
}
displayPlanes();
(_d = document.getElementById('departureDropDownMenuInput')) === null || _d === void 0 ? void 0 : _d.addEventListener("change", (event) => __awaiter(void 0, void 0, void 0, function* () {
    let destinationInputes = document.getElementById('destinationDropDownMenuInput');
    const target = event.target;
    let departure = target.value;
    let From_Airport = departure;
    const planes = yield fetchPlanes();
    let lastAirports = planes.filter(x => x.Airport_From == departure);
    lastAirports.forEach(element => {
        const option = document.createElement('option');
        option.value = `${element.Airport_To}`;
        option.innerText = `${element.Airport_To}`;
        destinationInputes === null || destinationInputes === void 0 ? void 0 : destinationInputes.appendChild(option);
    });
}));
document.addEventListener('DOMContentLoaded', () => {
    displayCheapestFlights('');
    displayPopularFlights('');
});
