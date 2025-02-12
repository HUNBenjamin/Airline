var __awaiter: Function = (this && this.__awaiter) || function (thisArg: any, _arguments: any, P: PromiseConstructor, generator: Function) {
    function adopt(value: any) { return value instanceof P ? value : new P(function (resolve: Function) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve: Function, reject: Function) {
        function fulfilled(value: any) { try { step((generator as unknown as Generator).next(value)); } catch (e) { reject(e); } }
        function rejected(value: any) { try { step((generator as unknown as Generator).throw(value)); } catch (e) { reject(e); } }
        function step(result: any) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};var _a, _b;
;

async function fetchPlanes() : Promise<Flight[]> {
    const response =  await fetch("http://localhost:3000/userFlights");
    if (!response.ok) {
        throw new Error("Failed to fetch planes");
    }
    const data = await response.json();
    return data;
}

// "id": 59,
// "Departure_Date": "2025-03-14",
// "Departure_Time": "07:00",
// "Destination_Date": "2025-03-14",
// "Destination_Time": "09:00",
// "Airport_From": "Melbourne",
// "Airport_To": "Budapest",
// "Price": 938,
// "Plane_Type": "Airbus A320",
// "Free Seats": 36,
// "Flight Number": "SKY884"

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



let cheapestFlightIds: number[] = [];

async function displayCheapestFlights(selectedCity: string) {
    try {
        const flights = await fetchPlanes();
        const cheapestFlights = flights
            .filter(flight => flight.Airport_From === selectedCity)
            .sort((a, b) => a.Price - b.Price)
            .slice(0, 4);

        // Store the IDs of cheapest flights
        cheapestFlightIds = cheapestFlights.map(flight => flight.id);

        const container = document.getElementById('cheapest-flights');
        if (container) {
            container.innerHTML = '';
            cheapestFlights.forEach(flight => {
                const card = document.createElement('div');
                card.className = 'flight-card';
                card.innerHTML = `
                    <h2>${flight.Airport_From} → ${flight.Airport_To}</h2>
                    <p>Date: ${flight.Departure_Date}</p>
                    <p>Time: ${flight.Departure_Time}:00</p>
                    <p class="price">Price: ${flight.Price} EUR</p>
                    <button onclick="bookFlight(${flight.id})">Book Now</button>
                `;
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error displaying cheapest flights:', error);
    }
}

function displayNoFlightsMessage(selectedCity: string) {
    const popularFlightsDiv = document.getElementById('popular-flights');
    if (popularFlightsDiv && selectedCity !== 'Departure') {
        popularFlightsDiv.innerHTML = `
            <div style="
                text-align: center;
                width: 100%;
                background-color: rgba(255, 255, 255, 0.8);
                padding: 15px;
                border-radius: 8px;
            ">
                <span style="
                    color: red;
                    font-weight: bold;
                ">
                    Nincs több megjeleníthető repjegy a választott ${selectedCity} indulási helyről
                </span>
            </div>
        `;
    } else if (popularFlightsDiv) {
        popularFlightsDiv.innerHTML = '';
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
            container.style.display = 'flex';
            container.style.flexDirection = 'row';
            container.style.justifyContent = 'space-between';
            container.style.gap = '20px';
            container.style.padding = '20px';

            popularFlights.forEach(flight => {
                const card = document.createElement('div');
                card.className = 'flight-card';
                card.style.flex = '1';
                card.style.minWidth = '250px';
                card.style.maxWidth = '300px';
                card.innerHTML = `
                    <h2>${flight.Airport_From} → ${flight.Airport_To}</h2>
                    <p>Date: ${flight.Departure_Date}</p>
                    <p>Time: ${flight.Departure_Time}:00</p>
                    <p class="price">Price: ${flight.Price} EUR</p>
                    <p>Free seats: ${flight.Free_seats}</p>
                    <button onclick="bookFlight(${flight.id})">Book Now</button>
                `;
                container.appendChild(card);
            });
        }
        if (popularFlights.length === 0) {
            displayNoFlightsMessage(selectedCity);
        }
    } catch (error) {
        console.error('Error displaying popular flights:', error);
    }
}


document.getElementById('departureDropDownMenuInput')?.addEventListener("change", async (event) => {
    const target = event.target as HTMLSelectElement;
    const selectedCity = target.value;
    
    // Update both displays when city changes
    displayCheapestFlights(selectedCity);
    displayPopularFlights(selectedCity);
    
    // Update destination dropdown
    let destinationInputes = document.getElementById('destinationDropDownMenuInput');
    if (destinationInputes) {
        destinationInputes.innerHTML = ''; // Clear existing options
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
async function displayPlanes(): Promise<void> {
    const plane = await fetchPlanes();
    let BigPlanes = plane;
    let citiesFrom = plane.map(x => x.Airport_From);
    let departureInputes = document.getElementById('departureDropDownMenuInput');
    citiesFrom.forEach(element => {
        const option = document.createElement('option');
        option.value = `${element}`;
        option.innerText = `${element}`;
        departureInputes?.appendChild(option);
    });
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






