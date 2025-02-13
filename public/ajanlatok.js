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
        const citiesFrom = planes.map(x => x.Airport_From);
        citiesFrom.forEach(element => {
            const option = document.createElement('option');
            option.value = element;
            option.innerText = element;
            departureInputes === null || departureInputes === void 0 ? void 0 : departureInputes.appendChild(option);
        });
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
            cheapestFlightIds = cheapestFlights.map(flight => flight.id);
            const container = document.getElementById('cheapest-flights');
            if (container) {
                container.innerHTML = '';
                container.className = 'row g-4';
                cheapestFlights.forEach(flight => {
                    const card = document.createElement('div');
                    card.className = 'col-xl-3 col-lg-3 col-md-6 col-sm-12';
                    card.innerHTML = `
                    <div class="card h-100 shadow">
                        <div class="card-body d-flex flex-column">
                            <h4 class="card-title text-center mb-4">${flight.Airport_From} → ${flight.Airport_To}</h4>
                            <div class="card-text text-center">
                                <h5 class="mb-3">Date: ${flight.Departure_Date}</h5>
                                <h5 class="mb-3">Time: ${flight.Departure_Time}:00</h5>
                                <h3 class="price text-primary mb-4">${flight.Price} EUR</h3>
                            </div>
                            <button class="btn btn-primary btn-lg mt-auto" onclick="bookFlight(${flight.id})">
                                Book Now
                            </button>
                        </div>
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
                container.className = 'row g-4';
                popularFlights.forEach(flight => {
                    const card = document.createElement('div');
                    card.className = 'col-xl-3 col-lg-3 col-md-6 col-sm-12';
                    card.innerHTML = `
                    <div class="card h-100 shadow">
                        <div class="card-body d-flex flex-column">
                            <h4 class="card-title text-center mb-4">${flight.Airport_From} → ${flight.Airport_To}</h4>
                            <div class="card-text text-center">
                                <h5 class="mb-3">Date: ${flight.Departure_Date}</h5>
                                <h5 class="mb-3">Time: ${flight.Departure_Time}:00</h5>
                                <h3 class="price text-primary mb-3">${flight.Price} EUR</h3>
                                <h5 class="mb-4">Free seats: ${flight.Free_seats}</h5>
                            </div>
                            <button class="btn btn-primary btn-lg mt-auto" onclick="bookFlight(${flight.id})">
                                Book Now
                            </button>
                        </div>
                    </div>
                `;
                    container.appendChild(card);
                });
            }
            if (popularFlights.length === 0) {
                const noFlightsMessage = document.createElement('div');
                noFlightsMessage.className = 'col-12 text-center';
                noFlightsMessage.innerHTML = `<h3>No popular flights available from ${selectedCity}</h3>`;
                container === null || container === void 0 ? void 0 : container.appendChild(noFlightsMessage);
            }
        }
        catch (error) {
            console.error('Error displaying popular flights:', error);
        }
    });
}
(_a = document.getElementById('departureDropDownMenuInput')) === null || _a === void 0 ? void 0 : _a.addEventListener("change", (event) => __awaiter(void 0, void 0, void 0, function* () {
    const target = event.target;
    const selectedCity = target.value;
    displayCheapestFlights(selectedCity);
    displayPopularFlights(selectedCity);
    let destinationInputes = document.getElementById('destinationDropDownMenuInput');
    if (destinationInputes) {
        destinationInputes.innerHTML = '';
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
displayPlanes();
(_b = document.getElementById('departureDropDownMenuInput')) === null || _b === void 0 ? void 0 : _b.addEventListener("change", (event) => __awaiter(void 0, void 0, void 0, function* () {
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
