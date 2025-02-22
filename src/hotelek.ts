export interface Hotel {
    id: number;
    name: string;
    city: string;
    pricePerNight: number;
    maxGuests: number;
    amenities: string[];
    rating: number;
    availableFrom: string;
    availableTo: string;
}

interface Flight {
    id: number;
    Departure_Date: string;
    Departure_Time: number;
    Destination_Date: string;
    Destination_Time: number;
    Airport_From: string;
    Airport_To: string;
    Price: number;
    Type_of_plane: string;
    Free_seats: number;
    Flight_Number: string;
}

let selectedHotels: Hotel[] = [];

export async function fetchHotels(): Promise<Hotel[]> {
    const response = await fetch("http://localhost:3000/hotels");
    if (!response.ok) {
        throw new Error("Failed to fetch hotels");
    }
    const data: Hotel[] = await response.json();
    return data;
}

async function fetchPlanes(): Promise<Flight[]> {
    const response = await fetch("http://localhost:3000/userFlights");
    if (!response.ok) {
        throw new Error("Failed to fetch planes");
    }
    const data: Flight[] = await response.json();
    return data;
}

function saveFormData() {
    const destinationSelect = document.getElementById('hotelDestinationSelect') as HTMLSelectElement;
    const guestsInput = document.getElementById('guestsInput') as HTMLInputElement;
    const dateFromInput = document.getElementById('dateFromInput') as HTMLInputElement;
    const dateToInput = document.getElementById('dateToInput') as HTMLInputElement;

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
        const destinationSelect = document.getElementById('hotelDestinationSelect') as HTMLSelectElement;
        const guestsInput = document.getElementById('guestsInput') as HTMLInputElement;
        const dateFromInput = document.getElementById('dateFromInput') as HTMLInputElement;
        const dateToInput = document.getElementById('dateToInput') as HTMLInputElement;

        destinationSelect.value = parsedData.destination;
        guestsInput.value = parsedData.guests;
        dateFromInput.value = parsedData.dateFrom;
        dateToInput.value = parsedData.dateTo;
    }
}

function initializeHotelSearch() {
    const searchForm = document.getElementById('hotelSearchForm') as HTMLFormElement;
    const destinationSelect = document.getElementById('hotelDestinationSelect') as HTMLSelectElement;
    const hotelContainer = document.getElementById('hotelList') as HTMLDivElement;

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const guestCount = parseInt((document.getElementById('guestsInput') as HTMLInputElement).value);
        const dateFrom = (document.getElementById('dateFromInput') as HTMLInputElement).value;
        const dateTo = (document.getElementById('dateToInput') as HTMLInputElement).value;

        const hotels = await fetchHotels();
        const filteredHotels = hotels.filter(hotel => 
            hotel.city === destinationSelect.value &&
            hotel.maxGuests >= guestCount &&
            new Date(hotel.availableFrom) <= new Date(dateFrom) &&
            new Date(hotel.availableTo) >= new Date(dateTo)
        );

        selectedHotels = filteredHotels; 
        displayFilteredHotels(filteredHotels, hotelContainer);
        saveFormData();
    });

    loadFormData();
}

export async function displayHotels(): Promise<void> {
    try {
        const flights = await fetchPlanes();
        const destinationSelect = document.getElementById('hotelDestinationSelect') as HTMLSelectElement;
        
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
    } catch (error) {
        console.error('Error in displayHotels:', error);
    }
}

function calculateTotalPrice(pricePerNight: number, dateFrom: string, dateTo: string, guests: number): number {
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    const timeDiff = toDate.getTime() - fromDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return pricePerNight * nights * guests;
}

function displayFilteredHotels(hotels: Hotel[], container: HTMLDivElement): void {
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
                    <span>Összérték: <strong>${calculateTotalPrice(hotel.pricePerNight, (document.getElementById('dateFromInput') as HTMLInputElement).value, (document.getElementById('dateToInput') as HTMLInputElement).value, parseInt((document.getElementById('guestsInput') as HTMLInputElement).value))} EUR</strong></span>
                </div>
            </div>
        `;
        container.appendChild(hotelCard);

        // Foglalás gomb eseménykezelője
        const bookButton = hotelCard.querySelector('.book-hotel-btn') as HTMLButtonElement;
        bookButton.addEventListener('click', () => {
            const hotelId = bookButton.dataset.hotelId;
            const guests = parseInt((document.getElementById('guestsInput') as HTMLInputElement).value);
            if (hotelId) {
                bookHotel(parseInt(hotelId), hotel.name);
            }
        });    });
}

async function bookHotel(hotelId: number, hotelName: string): Promise<void> {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    currentUser.hotelBookings.push(hotelId);
    setCurrentUser(currentUser);

    try {
        const response = await fetch(`http://localhost:3000/users/${currentUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentUser),
        });

        if (!response.ok) throw new Error('Failed to update user on server');
    } catch (error) {
        console.error('Error updating user:', error);
    }

    alert(`Hotel foglalás ${hotelName} sikeresen létrehozva!`);
}

// Add these function declarations
export function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}
export function setCurrentUser(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Define the User interface
interface User {
    hotelBookings: number[];
    // Add other properties as needed
}
function applyFilters() {
    const selectedAmenities = Array.from(document.querySelectorAll<HTMLInputElement>('.checkbox-group input:checked'))
        .map(checkbox => checkbox.value);
    const ratingElement = document.querySelector<HTMLElement>('.rating-filter .star.selected:last-child');
    const selectedRating = ratingElement ? parseFloat(ratingElement.dataset.value || "0") : 0;
    const priceInput = document.getElementById('priceRange') as HTMLInputElement | null;
    const selectedPrice = priceInput ? parseInt(priceInput.value) : 0;
    const sortBy = (document.getElementById('sortSelect') as HTMLSelectElement | null)?.value || "price-asc";

    let filteredHotels = selectedHotels.filter(hotel => {
        const matchesAmenities = selectedAmenities.length === 0 || selectedAmenities.every(amenity => hotel.amenities.includes(amenity));
        const matchesRating = selectedRating === 0 || (hotel.rating >= selectedRating - 0.5 && hotel.rating <= selectedRating); // Módosított feltétel
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

    const hotelContainer = document.getElementById('hotelList') as HTMLDivElement | null;
    if (hotelContainer) {
        displayFilteredHotels(filteredHotels, hotelContainer);
    }
}

function initializeRatingFilter() {
    const ratingFilter = document.getElementById('ratingFilter');
    if (!ratingFilter) return;
    ratingFilter.innerHTML = '';

    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.textContent = '☆';
        star.dataset.value = i.toString(); // Itt tároljuk a csillag értékét (1-5)
        star.addEventListener('click', () => {
            const stars = ratingFilter.querySelectorAll('.star');
            stars.forEach((s, index) => {
                if (index < i) {
                    s.classList.add('selected');
                    s.textContent = '⭐️';
                } else {
                    s.classList.remove('selected');
                    s.textContent = '☆';
                }
            });
            applyFilters(); // Szűrés alkalmazása
        });
        ratingFilter.appendChild(star);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    displayHotels();
    initializeRatingFilter();

    const applyFiltersButton = document.getElementById('applyFilters') as HTMLButtonElement | null;
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
        searchButton.parentElement?.insertBefore(sortSelect, searchButton.nextSibling);
    }

    const priceRangeInput = document.getElementById('priceRange') as HTMLInputElement | null;
    const priceValueDisplay = document.getElementById('priceValue') as HTMLSpanElement | null;

    if (priceRangeInput && priceValueDisplay) {
        priceRangeInput.addEventListener('input', () => {
            priceValueDisplay.textContent = `${priceRangeInput.value} EUR`;
        });
    }
});