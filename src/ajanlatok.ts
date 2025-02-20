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
    const citiesFrom = [...new Set(planes.map(x => x.Airport_From))]; 

    citiesFrom.forEach(element => {
        const option = document.createElement('option');
        option.value = element;
        option.innerText = element;
        departureInputes?.appendChild(option);
    });

    departureInputes?.addEventListener('change', (e) => {
        const selectedCity = (e.target as HTMLSelectElement).value;
        const citiesTo = [...new Set(planes
            .filter(flight => flight.Airport_From === selectedCity)
            .map(flight => flight.Airport_To))];

        if (destinationInputes) {
            destinationInputes.innerHTML = '<option value="">Select Destination</option><option value="anywhere">Bárhova</option>';

            citiesTo.forEach(element => {
                const option = document.createElement('option');
                option.value = element;
                option.innerText = element;
                destinationInputes.appendChild(option);
            });
        }
    });}

let cheapestFlightIds: number[] = [];

async function displayCheapestFlights(selectedCity: string, guests: number, destination?: string, dateFrom?: string) {
    try {
        const flights = await fetchPlanes();
        let filteredFlights = flights.filter(flight => flight.Airport_From === selectedCity);

        if (!selectedCity || selectedCity === "") {
            filteredFlights = [];
        } else if (!destination || destination === "anywhere") {
            filteredFlights = flights.filter(flight => flight.Airport_From === selectedCity);
        } else {
            filteredFlights = flights.filter(
                flight => flight.Airport_From === selectedCity && flight.Airport_To === destination
            );
        }

        if (dateFrom) {
            filteredFlights = filteredFlights.filter(flight => flight.Departure_Date === dateFrom);
        }

        const cheapestFlights = filteredFlights
            .sort((a, b) => a.Price - b.Price)
            .slice(0, 4);

        cheapestFlightIds = cheapestFlights.map(flight => flight.id);

        const container = document.getElementById('cheapest-flights');
        const title = document.getElementById('cheapest-flights-title');
        if (container && title) {
            container.innerHTML = '';
            container.className = 'flight-list';

            if (cheapestFlights.length > 0) {
                title.style.display = 'block';
            } else {
                title.style.display = 'none'; 
            }

            cheapestFlights.forEach(flight => {
                const totalPrice = flight.Price * guests;
                const card = document.createElement('div');
                card.className = 'flight-card';
                card.innerHTML = `
                    <div class="flight-info">
                        <img src="img/cities/${flight.Airport_To}.jpg" class="rounded me-3" alt="Airline Logo" width="150">
                        <div class="flight-time">
                            <strong>${flight.Departure_Time}:00</strong>
                            <span>${flight.Airport_From}</span>
                        </div>
                        <div class="flight-time">
                            ✈ ${flight.Flight_Number}
                            <span>${calculator(flight.Departure_Time.toString(), flight.Destination_Time.toString())} h</span>
                        </div>
                        <div class="flight-time">
                            <strong>${flight.Destination_Time}:00</strong>
                            <span>${flight.Airport_To}</span>
                        </div>
                    </div>
                    <div class="flight-price">
                        <h3 class="my-auto">${flight.Price} Eur</h3>
                        <p>Total: ${totalPrice} Eur</p>
                        <button class="select-btn ms-3" onclick="bookFlight(${flight.id})">Select</button>
                    </div>
                `;
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error displaying cheapest flights:', error);
    }
}

async function displayPopularFlights(selectedCity: string, guests: number, destination?: string, dateFrom?: string) {
    try {
        const flights = await fetchPlanes();
        let filteredFlights = flights.filter(flight => flight.Airport_From === selectedCity);

        if (!selectedCity || selectedCity === "") {
            filteredFlights = [];
        } else if (!destination || destination === "anywhere") {
            filteredFlights = flights.filter(flight => flight.Airport_From === selectedCity);
        } else {
            filteredFlights = flights.filter(
                flight => flight.Airport_From === selectedCity && flight.Airport_To === destination
            );
        }

        if (dateFrom) {
            filteredFlights = filteredFlights.filter(flight => flight.Departure_Date === dateFrom);
        }

        const popularFlights = filteredFlights
            .filter(flight => !cheapestFlightIds.includes(flight.id))
            .sort((a, b) => a.Free_seats - b.Free_seats)
            .slice(0, 4);

        const container = document.getElementById('popular-flights');
        const title = document.getElementById('popular-flights-title');
        if (container && title) {
            container.innerHTML = '';
            container.className = 'flight-list';

            if (popularFlights.length > 0) {
                title.style.display = 'block';
            } else {
                title.style.display = 'none'; 
            }

            popularFlights.forEach(flight => {
                const totalPrice = flight.Price * guests;
                const card = document.createElement('div');
                card.className = 'flight-card';
                card.innerHTML = `
                    <div class="flight-info">
                        <img src="img/cities/${flight.Airport_To}.jpg" class="rounded me-3" alt="Airline Logo" width="150">
                        <div class="flight-time">
                            <strong>${flight.Departure_Time}:00</strong>
                            <span>${flight.Airport_From}</span>
                        </div>
                        <div class="flight-time">
                            ✈ ${flight.Flight_Number}
                            <span>${calculator(flight.Departure_Time.toString(), flight.Destination_Time.toString())} h</span>
                        </div>
                        <div class="flight-time">
                            <strong>${flight.Destination_Time}:00</strong>
                            <span>${flight.Airport_To}</span>
                        </div>
                    </div>
                    <div class="flight-price">
                        <h3 class="my-auto">${flight.Price} Eur</h3>
                        <p>Total: ${totalPrice} Eur</p>
                        <button class="select-btn ms-3" onclick="bookFlight(${flight.id})">Select</button>
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

function calculator(a: string, b: string) {
    let time1 = a.split(':');
    let time2 = b.split(':');
    if (Number(time1[0]) > Number(time2[0])) {
        return 24 - Number(time1[0]) + Number(time2[0]);
    } else {
        return Number(time2[0]) - Number(time1[0]);
    }
}

document.getElementById('flightSearchForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const departureSelect = document.getElementById('departureDropDownMenuInput') as HTMLSelectElement;
    const destinationSelect = document.getElementById('destinationDropDownMenuInput') as HTMLSelectElement;
    const guestsInput = document.getElementById('guestsInput') as HTMLInputElement;
    const dateFromInput = document.getElementById('dateFromInput') as HTMLInputElement;

    const selectedCity = departureSelect.value;
    const destination = destinationSelect.value;
    const guests = parseInt(guestsInput.value);
    const dateFrom = dateFromInput.value || undefined;

    displayCheapestFlights(selectedCity, guests, destination, dateFrom);
    displayPopularFlights(selectedCity, guests, destination, dateFrom);
});

document.getElementById('flightSearchForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const departureSelect = document.getElementById('departureDropDownMenuInput') as HTMLSelectElement;
    const destinationSelect = document.getElementById('destinationDropDownMenuInput') as HTMLSelectElement;
    const guestsInput = document.getElementById('guestsInput') as HTMLInputElement;
    const dateFromInput = document.getElementById('dateFromInput') as HTMLInputElement;

    const selectedCity = departureSelect.value;
    const guests = parseInt(guestsInput.value);
    const dateFrom = dateFromInput.value || undefined; 

    if (destinationSelect.value === "anywhere" || destinationSelect.value === "") {
        displayCheapestFlights(selectedCity, guests, undefined, dateFrom);
        displayPopularFlights(selectedCity, guests, undefined, dateFrom);
    } else {
        displayCheapestFlights(selectedCity, guests, destinationSelect.value, dateFrom);
        displayPopularFlights(selectedCity, guests, destinationSelect.value, dateFrom);
    }
    
});

document.addEventListener('DOMContentLoaded', () => {
    displayPlanes();
});