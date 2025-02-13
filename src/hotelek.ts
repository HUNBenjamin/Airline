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

        displayFilteredHotels(filteredHotels, hotelContainer);
    });
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

function displayFilteredHotels(hotels: Hotel[], container: HTMLDivElement): void {
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
