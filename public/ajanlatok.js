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
function displayCheapestFlights() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const flights = yield fetchPlanes();
            const cheapestFlights = flights
                .sort((a, b) => a.Price - b.Price)
                .slice(0, 4);
            const container = document.getElementById('cheapest-flights');
            if (container) {
                container.innerHTML = '';
                cheapestFlights.forEach(flight => {
                    const card = document.createElement('div');
                    card.className = 'flight-card';
                    card.innerHTML = `
                    <h2>${flight.Airport_To}</h2>
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
// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    displayCheapestFlights();
});
function displayPopularFlights() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const flights = yield fetchPlanes();
            const popularFlights = flights
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
                popularFlights.forEach((flight) => {
                    const card = document.createElement('div');
                    card.className = 'flight-card';
                    card.style.flex = '1';
                    card.style.minWidth = '250px';
                    card.style.maxWidth = '300px';
                    card.innerHTML = `
                    <h2>${flight.Airport_To}</h2>
                    <p>Date: ${flight.Departure_Date}</p>
                    <p>Time: ${flight.Departure_Time}:00</p>
                    <p class="price">Price: ${flight.Price} EUR</p>
                    <button onclick="bookFlight(${flight.id})">Book Now</button>
                    <p>Free seats: ${flight.Free_seats}</p>
                `;
                    container.appendChild(card);
                });
            }
        }
        catch (error) {
            console.error('Error displaying popular flights:', error);
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    displayCheapestFlights();
    displayPopularFlights();
});
