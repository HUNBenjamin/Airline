export interface Flight {
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

export async function fetchPlanes(): Promise<Flight[]> {
    const response = await fetch("http://localhost:3000/userFlights");
    if (!response.ok) {
        throw new Error("Failed to fetch planes");
    }
    const data: Flight[] = await response.json();
    return data;
}

export async function displayPlanes(): Promise<void> {
    const planes = await fetchPlanes();
    const departureInputes = document.getElementById('departureDropDownMenuInput');
    const destinationInputes = document.getElementById('destinationDropDownMenuInput');
    const citiesFrom = [...new Set(planes.map(x => x.Airport_From))]; // Egyedi indulási városok
    
    // Indulási városok feltöltése
    citiesFrom.forEach(element => {
        const option = document.createElement('option');
        option.value = element;
        option.innerText = element;
        departureInputes?.appendChild(option);
    });

    // Célállomások feltöltése (kivéve "Bárhova")
    const citiesTo = [...new Set(planes.map(x => x.Airport_To))]; // Egyedi célállomások
    citiesTo.forEach(element => {
        const option = document.createElement('option');
        option.value = element;
        option.innerText = element;
        destinationInputes?.appendChild(option);
    });
}

let cheapestFlightIds: number[] = [];

async function displayCheapestFlights(selectedCity: string, guests: number, dateFrom?: string) {
    try {
        const flights = await fetchPlanes();
        let filteredFlights = flights.filter(flight => flight.Airport_From === selectedCity);

        // Dátum szűrés, ha meg van adva
        if (dateFrom) {
            filteredFlights = filteredFlights.filter(flight => flight.Departure_Date === dateFrom);
        }

        const cheapestFlights = filteredFlights
            .sort((a, b) => a.Price - b.Price)
            .slice(0, 4);

        cheapestFlightIds = cheapestFlights.map(flight => flight.id);

        const container = document.getElementById('cheapest-flights');
        if (container) {
            container.innerHTML = '';
            container.className = 'flight-list';

            cheapestFlights.forEach(flight => {
                const totalPrice = flight.Price * guests;
                const card = document.createElement('div');
                card.className = 'flight-card';
                card.innerHTML = `
                    <div class="flight-card-left">
                        <img src="img/cities/${flight.Airport_To}.jpg" alt="${flight.Airport_To}" class="flight-image">
                    </div>
                    <div class="flight-card-middle">
                        <div class="flight-header">
                            <h3>${flight.Airport_From} → ${flight.Airport_To}</h3>
                        </div>
                        <div class="seats">
                            <p>Date: ${flight.Departure_Date}</p>
                            <p>Time: ${flight.Departure_Time}:00</p>
                            <p>Price per person: ${flight.Price} EUR</p>
                            <p><strong>Total price: ${totalPrice} EUR</strong></p>
                        </div>
                    </div>
                    <div class="flight-card-right">
                        <button class="book-flight-btn" onclick="bookFlight(${flight.id})">Book Now</button>
                    </div>
                `;
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error displaying cheapest flights:', error);
    }
}

async function displayPopularFlights(selectedCity: string, guests: number, dateFrom?: string) {
    try {
        const flights = await fetchPlanes();
        let filteredFlights = flights.filter(flight => flight.Airport_From === selectedCity);

        // Dátum szűrés, ha meg van adva
        if (dateFrom) {
            filteredFlights = filteredFlights.filter(flight => flight.Departure_Date === dateFrom);
        }

        const popularFlights = filteredFlights
            .filter(flight => !cheapestFlightIds.includes(flight.id))
            .sort((a, b) => a.Free_seats - b.Free_seats)
            .slice(0, 4);

        const container = document.getElementById('popular-flights');
        if (container) {
            container.innerHTML = '';
            container.className = 'flight-list';

            popularFlights.forEach(flight => {
                const totalPrice = flight.Price * guests;
                const card = document.createElement('div');
                card.className = 'flight-card';
                card.innerHTML = `
                    <div class="flight-card-left">
                        <img src="img/cities/${flight.Airport_To}.jpg" alt="${flight.Airport_To}" class="flight-image">
                    </div>
                    <div class="flight-card-middle">
                        <div class="flight-header">
                            <h3>${flight.Airport_From} → ${flight.Airport_To}</h3>
                        </div>
                        <div class="seats">
                            <p>Date: ${flight.Departure_Date}</p>
                            <p>Time: ${flight.Departure_Time}:00</p>
                            <p>Price per person: ${flight.Price} EUR</p>
                            <p><strong>otal price: ${totalPrice} EUR</strong></p>
                        </div>
                    </div>
                    <div class="flight-card-right">
                        <button class="book-flight-btn" onclick="bookFlight(${flight.id})">Book Now</button>
                    </div>
                `;
                container.appendChild(card);
            });
        }
        if (popularFlights.length === 0) {
            const noFlightsMessage = document.createElement('div');
            noFlightsMessage.className = 'no-flights';
            noFlightsMessage.innerHTML = `<h3>No popular flights available from ${selectedCity}</h3>`;
            container?.appendChild(noFlightsMessage);
        }
    } catch (error) {
        console.error('Error displaying popular flights:', error);
    }
}

document.getElementById('flightSearchForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const departureSelect = document.getElementById('departureDropDownMenuInput') as HTMLSelectElement;
    const destinationSelect = document.getElementById('destinationDropDownMenuInput') as HTMLSelectElement;
    const guestsInput = document.getElementById('guestsInput') as HTMLInputElement;
    const dateFromInput = document.getElementById('dateFromInput') as HTMLInputElement;

    const selectedCity = departureSelect.value;
    const guests = parseInt(guestsInput.value);
    const dateFrom = dateFromInput.value || undefined; // Dátum opcionális

    if (destinationSelect.value === "anywhere") {
        // Ha "Bárhova" van kiválasztva, akkor minden célállomásra mutatjuk a repjegyeket
        displayCheapestFlights(selectedCity, guests, dateFrom);
        displayPopularFlights(selectedCity, guests, dateFrom);
    } else {
        // Ha konkrét célállomás van kiválasztva, akkor csak azokat mutatjuk
        displayCheapestFlights(selectedCity, guests, dateFrom);
        displayPopularFlights(selectedCity, guests, dateFrom);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    displayPlanes();
});