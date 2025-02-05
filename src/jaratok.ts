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

let BigPlanes: Plane[];
let From_Airport = "";
let To_Airport = "";

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
    BigPlanes = plane;
    
    let citiesFrom = plane.map(x => x.Airport_From)
    let departureInputes = document.getElementById('departureDropDownMenuInput')

    citiesFrom.forEach(element => {
        const option = document.createElement('option');
        option.value = `${element}`
        option.innerText = `${element}`
        
        departureInputes?.appendChild(option);
    });

    
    
}

displayPlanes()

document.getElementById('departureDropDownMenuInput')?.addEventListener("change",(event) => {
    let destinationInputes = document.getElementById('destinationDropDownMenuInput')

    const target = event.target as HTMLSelectElement;
    let departure = target.value;
    From_Airport = departure;
    let lastAirports = BigPlanes.filter(x => x.Airport_From == departure)
    lastAirports.forEach(element => {
        const option = document.createElement('option');
        option.value = `${element.Airport_To}`
        option.innerText = `${element.Airport_To}`
        
        destinationInputes?.appendChild(option);
    });
    

})
document.getElementById('destinationDropDownMenuInput')?.addEventListener("change",(event) => {
    const target = event.target as HTMLSelectElement;
    let To_Airport = target.value;
})


// let filteredPlanes : Plane[] = [];







