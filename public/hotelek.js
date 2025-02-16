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
function saveFormData() {
    const destinationSelect = document.getElementById('hotelDestinationSelect');
    const guestsInput = document.getElementById('guestsInput');
    const dateFromInput = document.getElementById('dateFromInput');
    const dateToInput = document.getElementById('dateToInput');
    const formData = {
        destination: destinationSelect.value,
        guests: guestsInput.value,
        dateFrom: dateFromInput.value,
        dateTo: dateToInput.value
    };
    localStorage.setItem('hotelFormData', JSON.stringify(formData));
}
function loadFormData() {
    const formData = localStorage.getItem('hotelFormData');
    if (formData) {
        const parsedData = JSON.parse(formData);
        const destinationSelect = document.getElementById('hotelDestinationSelect');
        const guestsInput = document.getElementById('guestsInput');
        const dateFromInput = document.getElementById('dateFromInput');
        const dateToInput = document.getElementById('dateToInput');
        destinationSelect.value = parsedData.destination;
        guestsInput.value = parsedData.guests;
        dateFromInput.value = parsedData.dateFrom;
        dateToInput.value = parsedData.dateTo;
    }
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
        saveFormData();
    }));
    loadFormData();
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
function calculateTotalPrice(pricePerNight, dateFrom, dateTo) {
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    const timeDiff = toDate.getTime() - fromDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return pricePerNight * nights;
}
function displayFilteredHotels(hotels, container) {
    container.innerHTML = hotels.length === 0
        ? '<div class="no-hotels">Erre az időszakra/főre nincs elérhető szállás.</div>'
        : '';
    hotels.forEach(hotel => {
        const hotelCard = document.createElement('div');
        hotelCard.className = 'hotel-card';
        hotelCard.innerHTML = `
            <div class="hotel-card-left">
                <img src="img/hotels/${hotel.id}.jpg" alt="Hotel Image" class="hotel-image">
            </div>
            <div class="hotel-card-middle">
                <div class="hotel-header">
                    <h3>${hotel.name}</h3>
                </div>
                <div class="amenities">
                    <p>Szolgáltatások:</p>
                    <ul>${hotel.amenities.map(amenity => `<li>${amenity}</li>`).join('')}</ul>
                </div>
                <div class="price-section">     
                    <p>Ár/éjszaka: ${hotel.pricePerNight} EUR</p>
                </div>
            </div>
            <div class="hotel-card-right">
                <div class="rating-line">
                    <span class="rating">${'⭐️'.repeat(Math.floor(hotel.rating))}${hotel.rating % 1 >= 0.5 && hotel.rating % 1 < 1 ? '⯨' : ''}</span>
                    <span class="rating-number">${hotel.rating}/5</span>
                </div>
                <button class="book-hotel-btn" data-hotel-id="${hotel.id}">Foglalás</button>
                <div class="total-price-line">
                    <span>Összérték: ${calculateTotalPrice(hotel.pricePerNight, document.getElementById('dateFromInput').value, document.getElementById('dateToInput').value)} <span class="currency">EUR</span></span>
                </div>
            </div>
        `;
        container.appendChild(hotelCard);
    });
}
// Szűrőpanel hozzáadása
function addFilterPanel() {
    const filterPanel = document.createElement('div');
    filterPanel.className = 'filter-panel';
    filterPanel.innerHTML = `
        <h3>Szűrők</h3>
        <div class="filter-group">
            <label for="amenityFilter">Extrák:</label>
            <select id="amenityFilter" multiple>
                <option value="Free WiFi">Free WiFi</option>
                <option value="Breakfast Included">Breakfast Included</option>
                <option value="Gym">Gym</option>
                <option value="Airport Shuttle">Airport Shuttle</option>
                <option value="Pool">Pool</option>
                <option value="Spa">Spa</option>
                <option value="Sauna">Sauna</option>
                <option value="City View">City View</option>
                <option value="Parking">Parking</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Bar">Bar</option>
                <option value="Conference Room">Conference Room</option>
                <option value="Fine Dining">Fine Dining</option>
                <option value="Rooftop Bar">Rooftop Bar</option>
                <option value="Lake View">Lake View</option>
                <option value="Beach Access">Beach Access</option>
                <option value="Mountain View">Mountain View</option>
                <option value="Business Center">Business Center</option>
            </select>
        </div>
        <div class="filter-group">
            <label for="ratingFilter">Csillagok száma:</label>
            <select id="ratingFilter">
                <option value="0">Mindegy</option>
                <option value="1">1 csillag</option>
                <option value="2">2 csillag</option>
                <option value="3">3 csillag</option>
                <option value="4">4 csillag</option>
                <option value="5">5 csillag</option>
            </select>
        </div>
        <div class="filter-group">
            <label for="priceRange">Árintervallum:</label>
            <input type="range" id="priceRange" min="0" max="500" step="50">
            <span id="priceRangeValue">0 - 500 EUR</span>
        </div>
        <button id="applyFilters">Szűrők alkalmazása</button>
    `;
    const container = document.querySelector('.content-overlay');
    container === null || container === void 0 ? void 0 : container.insertBefore(filterPanel, container.firstChild);
    const priceRange = document.getElementById('priceRange');
    const priceRangeValue = document.getElementById('priceRangeValue');
    priceRange.addEventListener('input', () => {
        priceRangeValue.textContent = `0 - ${priceRange.value} EUR`;
    });
    const applyFiltersButton = document.getElementById('applyFilters');
    applyFiltersButton.addEventListener('click', () => {
        const selectedAmenities = Array.from(document.getElementById('amenityFilter').selectedOptions).map(option => option.value);
        const selectedRating = parseInt(document.getElementById('ratingFilter').value);
        const selectedPrice = parseInt(priceRange.value);
        const hotelContainer = document.getElementById('hotelList');
        const hotels = Array.from(hotelContainer.querySelectorAll('.hotel-card')).map(card => {
            var _a;
            const hotelId = parseInt(((_a = card.querySelector('.book-hotel-btn')) === null || _a === void 0 ? void 0 : _a.getAttribute('data-hotel-id')) || '0');
            return selectedHotels.find(hotel => hotel.id === hotelId);
        }).filter(hotel => hotel !== undefined);
        const filteredHotels = hotels.filter(hotel => {
            const matchesAmenities = selectedAmenities.length === 0 || selectedAmenities.every(amenity => hotel.amenities.includes(amenity));
            const matchesRating = selectedRating === 0 || Math.floor(hotel.rating) === selectedRating;
            const matchesPrice = hotel.pricePerNight <= selectedPrice;
            return matchesAmenities && matchesRating && matchesPrice;
        });
        displayFilteredHotels(filteredHotels, hotelContainer);
    });
}
document.addEventListener('DOMContentLoaded', () => {
    displayHotels();
    addFilterPanel();
});
