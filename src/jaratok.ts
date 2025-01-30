import { log } from "console";

interface Plane{
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
};
// interface Plane{
//     id: number,
//     Departure_Date: string,
//     Departure_Time: number,
//     Destination_Date: string,
//     Destination_Time: number,
//     Airport_From: string,
//     Airport_To: string,
//     Late: number,
//     Gate: string,
//     Price: number,
//     Type_of_plane: string,
//     Free_seats: number,
//     Flight_Number: string,
// };


async function fetchPlanes() : Promise<Plane[]> {
    const response =  await fetch("http://localhost:3000/userFlights");
    if (!response.ok) {
        throw new Error("Failed to fetch planes");
    }
    const data = await response.json();
    return data;
}

async function displayPlanes(type: string = 'all') {
    const plane = await fetchPlanes();
    
    let citiesFrom = plane.map(x => x.Airport_From)
    let departureInputes = document.getElementById('departureDropDownMenuInput')

    citiesFrom.forEach(element => {
        const option = document.createElement('option');
        option.value = `${element}`
        option.innerText = `${element}`
        console.log('1');
        
        departureInputes?.appendChild(option);

        //Honnan mennek kiszedése illetve hova mehetsz beleírása
    });

    
    
}

displayPlanes()

// let filteredPlanes : Plane[] = [];







