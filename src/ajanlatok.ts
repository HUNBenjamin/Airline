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
    const citiesFrom = planes.map(x => x.Airport_From);
    
    citiesFrom.forEach(element => {
        const option = document.createElement('option');
        option.value = element;
        option.innerText = element;
        departureInputes?.appendChild(option);
    });
}



let cheapestFlightIds: number[] = [];

async function displayCheapestFlights(selectedCity: string) {
    try {
        const flights = await fetchPlanes();
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
    } catch (error) {
        console.error('Error displaying cheapest flights:', error);
    }
}

async function displayPopularFlights(selectedCity: string) {
    try {
        const flights = await fetchPlanes();
        const popularFlights = flights
            .filter(flight => 
                flight.Airport_From === selectedCity && 
                !cheapestFlightIds.includes(flight.id)
            )
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
            container?.appendChild(noFlightsMessage);
        }
    } catch (error) {
        console.error('Error displaying popular flights:', error);
    }
}



document.getElementById('departureDropDownMenuInput')?.addEventListener("change", async (event) => {
    const target = event.target as HTMLSelectElement;
    const selectedCity = target.value;
    
    displayCheapestFlights(selectedCity);
    displayPopularFlights(selectedCity);
    

    let destinationInputes = document.getElementById('destinationDropDownMenuInput');
    if (destinationInputes) {
        destinationInputes.innerHTML = ''; 
        const planes = await fetchPlanes();
        let availableDestinations = planes
            .filter(x => x.Airport_From === selectedCity)
            .forEach(element => {
                const option = document.createElement('option');
                option.value = element.Airport_To;
                option.innerText = element.Airport_To;
                destinationInputes?.appendChild(option);
            });
    }
});



interface Plane {
    id: number,
    Departure_Date: string,
    Departure_Time: number,
    Destination_Date: string,
    Destination_Time: number,
    Airport_From: string,
    Airport_To: string,
    Price: number,
    Type_of_plane: string,
    Free_seats: number,
    Flight_Number: string,
}

displayPlanes();
document.getElementById('departureDropDownMenuInput')?.addEventListener("change", async (event) => {
    let destinationInputes = document.getElementById('destinationDropDownMenuInput');
    const target = event.target as HTMLSelectElement;
    let departure = target.value;
    let From_Airport = departure;
    const planes = await fetchPlanes();
    let lastAirports = planes.filter(x => x.Airport_From == departure);
    lastAirports.forEach(element => {
        const option = document.createElement('option');
        option.value = `${element.Airport_To}`;
        option.innerText = `${element.Airport_To}`;
        destinationInputes?.appendChild(option);
    });
});






document.addEventListener('DOMContentLoaded', () => {
    displayCheapestFlights('');
    displayPopularFlights('');
});






