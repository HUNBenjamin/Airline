var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let selectedHotels = [];
export function fetchHotels() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("http://localhost:3000/hotels");
        if (!response.ok) {
            throw new Error("Failed to fetch hotels");
        }
        const data = yield response.json();
        return data;
    });
}
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
function initializeHotelSearch() {
    const searchForm = document.getElementById('hotelSearchForm');
    const destinationSelect = document.getElementById('hotelDestinationSelect');
    const hotelContainer = document.getElementById('hotelList');
    searchForm.addEventListener('submit', (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const guestCount = parseInt(document.getElementById('guestsInput').value);
        const dateFrom = document.getElementById('dateFromInput').value;
        const dateTo = document.getElementById('dateToInput').value;
        const hotels = yield fetchHotels();
        const filteredHotels = hotels.filter(hotel => hotel.city === destinationSelect.value &&
            hotel.maxGuests >= guestCount &&
            new Date(hotel.availableFrom) <= new Date(dateFrom) &&
            new Date(hotel.availableTo) >= new Date(dateTo));
        displayFilteredHotels(filteredHotels, hotelContainer);
    }));
}
export function displayHotels() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const flights = yield fetchPlanes();
            const destinationSelect = document.getElementById('hotelDestinationSelect');
            if (destinationSelect) {
                destinationSelect.innerHTML = '<option value="">Válassz célállomást</option>';
                const uniqueDestinations = [...new Set(flights.map(x => x.Airport_To))];
                uniqueDestinations.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city;
                    option.textContent = city;
                    destinationSelect.appendChild(option);
                });
            }
            initializeHotelSearch();
        }
        catch (error) {
            console.error('Error in displayHotels:', error);
        }
    });
}
function displayFilteredHotels(hotels, container) {
    container.innerHTML = hotels.length === 0
        ? '<div class="no-hotels">Erre az időszakra/főre nincs elérhető szállás.</div>'
        : '';
    hotels.forEach(hotel => {
        const hotelCard = document.createElement('div');
        hotelCard.className = 'hotel-card';
        hotelCard.innerHTML = `
            <h3>${hotel.name}</h3>
            <p>Ár/éjszaka: ${hotel.pricePerNight} EUR</p>
            <p>Max vendégek: ${hotel.maxGuests} fő</p>
            <p>Értékelés: ${hotel.rating}/5</p>
            <p>Elérhető: ${hotel.availableFrom} - ${hotel.availableTo}</p>
            <div class="amenities">
                <p>Szolgáltatások:</p>
                <ul>${hotel.amenities.map(amenity => `<li>${amenity}</li>`).join('')}</ul>
            </div>
            <button class="book-hotel-btn" data-hotel-id="${hotel.id}">Foglalás</button>
        `;
        container.appendChild(hotelCard);
    });
}
document.addEventListener('DOMContentLoaded', displayHotels);
