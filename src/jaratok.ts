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
}

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

let AllPlanes: Plane[];
let From_Airport = "";
let To_Airport = "";
let FlyingDateTime = "";
let AvailablePlanes: Plane[];

async function fetchPlane() : Promise<Plane[]> {
    const response =  await fetch("http://localhost:3000/userFlights");
    if (!response.ok) {
        throw new Error("Failed to fetch planes");
    }
    const data = await response.json();
    return data;
}

async function displayPlane(type: string = 'all') {
    const plane = await fetchPlane();
    AllPlanes = plane;
    
    let citiesFrom = plane.map(x => x.Airport_From)
    let departureInputes = document.getElementById('departureDropDownMenuInput')

    citiesFrom.forEach(element => {
        const option = document.createElement('option');
        option.value = `${element}`
        option.innerText = `${element}`
        
        departureInputes?.appendChild(option);
    });

    
    
}

displayPlane()

document.getElementById('departureDropDownMenuInput')?.addEventListener("change",(event) => {
    let destinationInputes = document.getElementById('destinationDropDownMenuInput')

    const target = event.target as HTMLSelectElement;
    let departure = target.value;
    From_Airport = departure;
    let lastAirports = AllPlanes.filter(x => x.Airport_From == departure)
    lastAirports.forEach(element => {
        const option = document.createElement('option');
        option.value = `${element.Airport_To}`
        option.innerText = `${element.Airport_To}`
        
        destinationInputes?.appendChild(option);
    });
    

})
document.getElementById('destinationDropDownMenuInput')?.addEventListener("change",(event) => {
    const target = event.target as HTMLSelectElement;
    To_Airport = target.value;
    AvailablePlanes = AllPlanes.filter(x => x.Airport_From == From_Airport).filter(x => x.Airport_To == To_Airport)
    localStorage.setItem("planesList", JSON.stringify(AvailablePlanes));
    console.log(AvailablePlanes);
    
});


// (document.getElementById('flyingDateData') as HTMLInputElement).addEventListener("change", (event) => {
//     const target = event.target as HTMLSelectElement;
//     FlyingDateTime = target.value;  
// })

document.getElementById('DoneButton')?.addEventListener("click", (event) => {
    event?.preventDefault()
    console.log("Megy");
    const storedPlanes = localStorage.getItem("planesList");
    if (storedPlanes) {
        const restoredPlanes: Plane[] = JSON.parse(storedPlanes);
    
        console.log("Restored Planes List:", restoredPlanes);
        console.log(restoredPlanes);
        AvailablePlanes = restoredPlanes;
    }
    // const AvailablePlanes = AllPlanes.filter(x => x.Airport_From == From_Airport).filter(x => x.Airport_To == To_Airport)//.filter(x => x.Departure_Date < FlyingDateTime)
    let flightDiv = document.getElementById('fromDiv');
    AvailablePlanes.forEach(element => {
        
        const myDiv = document.createElement('div');
        myDiv.innerHTML += `<div class="flight-card">
                <div class="flight-info">
                    <img src="img/Logo_1000-1000.png" alt="Airline Logo" width="100">
                    <div id="flightFromDataFill" class="flight-time">
                        <strong>${element.Departure_Time}</strong>
                        <span>${element.Airport_From}</span>
                    </div>
                    <div id="flightCodeAndNumberFill" class="flight-time">
                        ✈ ${element.Flight_Number}
                        <span>${element.Destination_Time - element.Departure_Time}</span>
                    </div>
                    <div id="flightToDataFill" class="flight-time">
                        <strong>${element.Destination_Time}</strong>
                        <span>${element.Airport_To}</span>
                    </div>
                </div>
                <div id="filghtPriceFill" class="flight-price">
                    <p class="my-auto">${element.Price} Eur</p>
                    <!-- <div style="color: red; font-size: 18px;"><strong>Ft25,529</strong></div> -->
                    <button class="select-btn ms-3">Select</button>
                </div>
            </div>`;
            console.log(myDiv);
            
        
        flightDiv?.appendChild(myDiv);
    });
})
