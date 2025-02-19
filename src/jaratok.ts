interface Plane{
    id: number,
    Departure_Date: string,
    Departure_Time: string,
    Destination_Date: string,
    Destination_Time: string,
    Airport_From: string,
    Airport_To: string,
    Price: number,
    Type_of_plane: string,
    Free_seats: number,
    Flight_Number: string,
}

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
    let AirportFromSorted: string[] = [];
    citiesFrom.forEach(element => {
        if (!AirportFromSorted.includes(element)) {
            AirportFromSorted.push(element);
        }
        
    });

    let departureInputes = document.getElementById('departureDropDownMenuInput')

    AirportFromSorted.forEach(element => {
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
});



document.getElementById('DoneButton')?.addEventListener("click", (event) => {
    // event?.preventDefault()
    let flightDiv = document.getElementById('fromDiv') as HTMLDivElement;
    flightDiv.innerHTML = "";
    AvailablePlanes.forEach(element => {
        let myDiv = document.createElement('div');
        myDiv.innerHTML += `<div class="flight-card">
                <div class="flight-info">
                    <img src="img/Logo_1000-1000.png" alt="Airline Logo" width="150">
                    <div id="flightFromDataFill" class="flight-time">
                        <strong>${element.Departure_Time}</strong>
                        <span>${element.Airport_From}</span>
                    </div>
                    <div id="flightCodeAndNumberFill" class="flight-time">
                        ✈ ${element.Flight_Number}
                        <span>${calculator(element.Departure_Time, element.Destination_Time)} h</span>
                    </div>
                    <div id="flightToDataFill" class="flight-time">
                        <strong>${element.Destination_Time}</strong>
                        <span>${element.Airport_To}</span>
                    </div>
                </div>
                <div id="filghtPriceFill" class="flight-price">
                    <h3 class="my-auto">${element.Price} Eur</h3    >
                    <!-- <div style="color: red; font-size: 18px;"><strong>Ft25,529</strong></div> -->
                    <button class="select-btn ms-3">Select</button>
                </div>
            </div>`;
            console.log(myDiv);
            
        
        flightDiv?.appendChild(myDiv);
    });
})

function calculator(a: string, b: string) {
    let time1 = a.split(':')
    let time2 = b.split(':')
    if (Number(time1[0]) > Number(time2[0])){
        return 24 - Number(time1[0]) + Number(time2[0])
    }
    else{
        return  Number(time2[0]) - Number(time1[0]) 
    }
        


}
