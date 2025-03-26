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

function initializeHotelSearch() {
    const searchForm = document.getElementById('hotelSearchForm') as HTMLFormElement;
    const destinationSelect = document.getElementById('hotelDestinationSelect') as HTMLSelectElement;
    const hotelContainer = document.getElementById('hotelList') as HTMLDivElement;

    destinationSelect.addEventListener('change', () => {
        const selectedCity = destinationSelect.value;
        if (selectedCity) {
            const newUrl = `${window.location.pathname}?selectedCity=${encodeURIComponent(selectedCity)}`;
            history.pushState(null, '', newUrl);
        }
    });

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
    });

    // Automatikus keresés indítása, ha a URL-ben van selectedCity paraméter
    const urlParams = new URLSearchParams(window.location.search);
    const selectedCity = urlParams.get('selectedCity');
    if (selectedCity && destinationSelect.value === selectedCity) {
        searchForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
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
            destinationSelect.addEventListener('change', () => {
                const selectedCity = destinationSelect.value;
                if (selectedCity) {
                    const newUrl = `${window.location.pathname}?selectedCity=${encodeURIComponent(selectedCity)}`;
                    history.pushState(null, '', newUrl);
                }
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
                    <span class="rating">${'⭐️'.repeat(Math.floor(hotel.rating))}${hotel.rating % 1 >= 0.5 && hotel.rating % 1 < 1 ? '⭐️' : ''}</span>
                    <span class="rating-number">${hotel.rating}/5</span>
                </div>
                <button class="book-hotel-btn" data-hotel-id="${hotel.id}">Foglalás</button>
                <div class="total-price-line">
                    <span>Összérték: <strong>${calculateTotalPrice(hotel.pricePerNight, (document.getElementById('dateFromInput') as HTMLInputElement).value, (document.getElementById('dateToInput') as HTMLInputElement).value, parseInt((document.getElementById('guestsInput') as HTMLInputElement).value))} EUR</strong></span>
                </div>
            </div>
        `;
        container.appendChild(hotelCard);

        const bookButton = hotelCard.querySelector('.book-hotel-btn') as HTMLButtonElement;
        bookButton.addEventListener('click', () => {
            const hotelId = bookButton.dataset.hotelId;
            const guests = parseInt((document.getElementById('guestsInput') as HTMLInputElement).value);
            if (hotelId) {
                bookHotel(parseInt(hotelId), hotel.name);
            }
        });
    });
}

async function bookHotel(hotelId: number, hotelName: string): Promise<void> {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        const shouldRedirect = confirm("A foglaláshoz be kell jelentkezned. Kattints az 'OK' gombra a bejelentkezéshez.");
        if (shouldRedirect) {
            window.location.href = './login.html';
        }
        return;
    }

    const dateFrom = (document.getElementById('dateFromInput') as HTMLInputElement).value;
    const dateTo = (document.getElementById('dateToInput') as HTMLInputElement).value;
    const guests = parseInt((document.getElementById('guestsInput') as HTMLInputElement).value);

    currentUser.hotelBookings.push(hotelId);

    if (!currentUser.hotelBookingDates) {
        currentUser.hotelBookingDates = {};
    }

    currentUser.hotelBookingDates[hotelId] = { dateFrom, dateTo, guests };

    currentUser.guests = guests;

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

    alert(`${hotelName} foglalása sikeresen létrehozva!`);
}

export function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

export function setCurrentUser(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

interface User {
    hotelBookings: number[];
    hotelBookingDates: { [hotelId: number]: { dateFrom: string; dateTo: string; guests: number } };
    guests: number;
}

let selectedRating = 0; 

function applyFilters() {
    const selectedAmenities = Array.from(document.querySelectorAll<HTMLInputElement>('.checkbox-group input:checked'))
        .map(checkbox => checkbox.value);
    const priceInput = document.getElementById('priceRange') as HTMLInputElement | null;
    const selectedPrice = priceInput ? parseInt(priceInput.value) : 0;
    const sortBy = (document.getElementById('sortSelect') as HTMLSelectElement | null)?.value || "price-asc";

    let filteredHotels = selectedHotels.filter(hotel => {
        const matchesAmenities = selectedAmenities.length === 0 || selectedAmenities.every(amenity => hotel.amenities.includes(amenity));
        const matchesRating = selectedRating === 0 || (hotel.rating >= selectedRating - 0.5 && hotel.rating <= selectedRating);
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
        star.dataset.value = i.toString(); 
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
            selectedRating = i; 
        });
        ratingFilter.appendChild(star);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedCity = urlParams.get('selectedCity');
    const destinationSelect = document.getElementById('hotelDestinationSelect') as HTMLSelectElement;

    if (selectedCity && destinationSelect) {
        destinationSelect.value = selectedCity;
        destinationSelect.dispatchEvent(new Event('change'));
    }

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

document.addEventListener("DOMContentLoaded", () => {
    const dateFromInput = document.getElementById("dateFromInput") as HTMLInputElement;
    const dateToInput = document.getElementById("dateToInput") as HTMLInputElement;
    const guestsInput = document.getElementById("guestsInput") as HTMLInputElement;

    if (guestsInput) {
        guestsInput.value = "1";
        guestsInput.min = "1";
    }

    if (dateFromInput && dateToInput) {
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];
        dateFromInput.value = todayStr;
        dateFromInput.min = todayStr;

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split("T")[0];
        dateToInput.value = tomorrowStr;
        dateToInput.min = tomorrowStr;

        dateFromInput.addEventListener("change", () => {
            const selectedDate = new Date(dateFromInput.value);
            if (!isNaN(selectedDate.getTime())) {
                const nextDay = new Date(selectedDate);
                nextDay.setDate(nextDay.getDate() + 1);
                const minDate = nextDay.toISOString().split("T")[0];
                dateToInput.min = minDate;

                if (dateToInput.value && dateToInput.value < minDate) {
                    dateToInput.value = minDate;
                }
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedCity = urlParams.get("selectedCity");

    if (!selectedCity) {
        console.error("Nincs kiválasztott város.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/hotels");
        if (!response.ok) {
            throw new Error("Hiba a szállások lekérésekor.");
        }
        const hotels = await response.json();
        const filteredHotels = hotels.filter((hotel: { city: string; id: number; name: string; pricePerNight: number; rating: number; maxGuests: number; amenities: string[] }) => 
            hotel.city.toLowerCase() === selectedCity.toLowerCase()
        );
        const hotelContainer = document.getElementById("hotelList");
        if (!hotelContainer) {
            console.error("Nem található a hotelList elem.");
            return;
        }
        hotelContainer.innerHTML = "";

        if (filteredHotels.length === 0) {
            hotelContainer.innerHTML = `<p>Nincsenek elérhető szállások ebben a városban.</p>`;
        } else {
            filteredHotels.forEach((hotel: { id: number; name: string; pricePerNight: number; rating: number; maxGuests: number; amenities: string[] }) => {
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
                            <span class="rating">${'⭐️'.repeat(Math.floor(hotel.rating))}${hotel.rating % 1 >= 0.5 && hotel.rating % 1 < 1 ? '⭐️' : ''}</span>
                            <span class="rating-number">${hotel.rating}/5</span>
                        </div>
                        <button class="book-hotel-btn" data-hotel-id="${hotel.id}">Foglalás</button>
                        <div class="total-price-line">
                            <span>Összérték: <strong>${calculateTotalPrice(hotel.pricePerNight, (document.getElementById('dateFromInput') as HTMLInputElement).value, (document.getElementById('dateToInput') as HTMLInputElement).value, parseInt((document.getElementById('guestsInput') as HTMLInputElement).value))} EUR</strong></span>
                        </div>
                    </div>
                `;
                hotelContainer.appendChild(hotelCard);
        
                const bookButton = hotelCard.querySelector('.book-hotel-btn') as HTMLButtonElement;
                bookButton.addEventListener('click', () => {
                    const hotelId = bookButton.dataset.hotelId;
                    const guests = parseInt((document.getElementById('guestsInput') as HTMLInputElement).value);
                    if (hotelId) {
                        bookHotel(parseInt(hotelId), hotel.name);
                    }
                });
            });
        }
    } catch (error) {
        console.error("Hiba:", error);
    }
});