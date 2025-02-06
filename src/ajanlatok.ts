
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

async function displayCheapestFlights() {
    try {
        const flights = await fetchPlanes();
        const cheapestFlights = flights
            .sort((a, b) => a.Price - b.Price)
            .slice(0, 4);

        const container = document.getElementById('cheapest-flights');
        if (container) {
            container.innerHTML = '';
            
            cheapestFlights.forEach(flight => {
                const card = document.createElement('div');
                card.className = 'flight-card';
                card.innerHTML = `
                    <h2>${flight.Airport_To}</h2>
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    displayCheapestFlights();
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

async function displayPopularFlights() {
    try {
        const flights: Plane[] = await fetchPlanes();
        const popularFlights = flights
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
            
            popularFlights.forEach((flight: Plane) => {
                const card = document.createElement('div');
                card.className = 'flight-card';
                card.style.flex = '1';
                card.style.minWidth = '250px';
                card.style.maxWidth = '300px';
                card.innerHTML = `
                    <h2>${flight.Airport_To}</h2>
                    <p>Date: ${flight.Departure_Date}</p>
                    <p>Time: ${flight.Departure_Time}:00</p>
                    <p class="price">Price: ${flight.Price} EUR</p>
                    <button onclick="bookFlight(${flight.id})">Book Now</button>
                    <p>Free seats: ${flight.Free_seats}</p>
                `;
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error displaying popular flights:', error);
    }
}




document.addEventListener('DOMContentLoaded', () => {
    displayCheapestFlights();
    displayPopularFlights();
});






