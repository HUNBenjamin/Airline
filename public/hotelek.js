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
        selectedHotels = filteredHotels;
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
function calculateTotalPrice(pricePerNight, dateFrom, dateTo, guests) {
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    const timeDiff = toDate.getTime() - fromDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return pricePerNight * nights * guests;
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
                    <span class="rating">${'⭐️'.repeat(Math.floor(hotel.rating))}${hotel.rating % 1 >= 0.5 && hotel.rating % 1 < 1 ? '' : ''}</span>
                    <span class="rating-number">${hotel.rating}/5</span>
                </div>
                <button class="book-hotel-btn" data-hotel-id="${hotel.id}">Foglalás</button>
                <div class="total-price-line">
                    <span>Összérték: <strong>${calculateTotalPrice(hotel.pricePerNight, document.getElementById('dateFromInput').value, document.getElementById('dateToInput').value, parseInt(document.getElementById('guestsInput').value))} EUR</strong></span>
                </div>
            </div>
        `;
        container.appendChild(hotelCard);
    });
}
function applyFilters() {
    var _a;
    const selectedAmenities = Array.from(document.querySelectorAll('.checkbox-group input:checked'))
        .map(checkbox => checkbox.value);
    const ratingElement = document.querySelector('.rating-filter .star.selected:last-child');
    const selectedRating = ratingElement ? parseInt(ratingElement.dataset.value || "0") : 0;
    const priceInput = document.getElementById('priceRange');
    const selectedPrice = priceInput ? parseInt(priceInput.value) : 0;
    const sortBy = ((_a = document.getElementById('sortSelect')) === null || _a === void 0 ? void 0 : _a.value) || "price-asc";
    let filteredHotels = selectedHotels.filter(hotel => {
        const matchesAmenities = selectedAmenities.length === 0 || selectedAmenities.every(amenity => hotel.amenities.includes(amenity));
        const matchesRating = hotel.rating >= selectedRating;
        const matchesPrice = hotel.pricePerNight <= selectedPrice;
        return matchesAmenities && matchesRating && matchesPrice;
    });
    filteredHotels.sort((a, b) => {
        switch (sortBy) {
            case "price-asc": return a.pricePerNight - b.pricePerNight;
            case "price-desc": return b.pricePerNight - a.pricePerNight;
            case "rating-asc": return a.rating - b.rating;
            case "rating-desc": return b.rating - a.rating;
            default: return 0;
        }
    });
    const hotelContainer = document.getElementById('hotelList');
    if (hotelContainer) {
        displayFilteredHotels(filteredHotels, hotelContainer);
    }
}
function initializeRatingFilter() {
    const ratingFilter = document.getElementById('ratingFilter');
    if (!ratingFilter)
        return;
    ratingFilter.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.textContent = '☆';
        star.dataset.value = i.toString();
        star.addEventListener('click', () => {
            const stars = ratingFilter.querySelectorAll('.star');
            stars.forEach((s, index) => {
                if (index < i) {
                    s.classList.add('selected');
                    s.textContent = '⭐️';
                }
                else {
                    s.classList.remove('selected');
                    s.textContent = '☆';
                }
            });
            applyFilters();
        });
        ratingFilter.appendChild(star);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    var _a;
    displayHotels();
    initializeRatingFilter();
    const applyFiltersButton = document.getElementById('applyFilters');
    if (applyFiltersButton) {
        applyFiltersButton.classList.add('search-button');
        applyFiltersButton.addEventListener('click', applyFilters);
    }
    const sortSelect = document.createElement('select');
    sortSelect.id = 'sortSelect';
    sortSelect.style.marginLeft = '10px';
    sortSelect.style.padding = '5px';
    sortSelect.style.width = 'max-content';
    sortSelect.innerHTML = `
        <option value="price-asc">Ár (növekvő)</option>
        <option value="price-desc">Ár (csökkenő)</option>
        <option value="rating-asc">Értékelés (növekvő)</option>
        <option value="rating-desc">Értékelés (csökkenő)</option>
    `;
    sortSelect.addEventListener('change', applyFilters);
    const searchButton = document.querySelector('#hotelSearchForm button[type="submit"]');
    if (searchButton) {
        (_a = searchButton.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(sortSelect, searchButton.nextSibling);
    }
});
