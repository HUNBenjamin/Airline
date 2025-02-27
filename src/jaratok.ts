interface Plane{
    id: number,
    Departure_Date: string,
    Departure_Time: string,
    Destination_Date: string,
    Destination_Time: string,
    Airport_From: string,
    Airport_To: string,
    Price: number,
    Plane_Type: string,
    Free_Seats: number,
    Flight_Number: string,
}

let AllPlanes: Plane[];
let From_Airport = "";
let To_Airport = "";
let Passangers: number = 1;
let FlyingDateTime = "2025-03-19";
let AvailablePlanes: Plane[];

async function fetchPlane() : Promise<Plane[]> {
    const response =  await fetch("http://localhost:3000/userFlights");
    if (!response.ok) {
        throw new Error("Failed to fetch planes");
    }
    const data = await response.json();
    return data;
};

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
};

displayPlane()

document.getElementById('departureDropDownMenuInput')?.addEventListener("change",(event) => {
    let destinationInputes = document.getElementById('destinationDropDownMenuInput')
    const target = event.target as HTMLSelectElement;
    From_Airport = target.value;
    let lastAirportsName = AllPlanes.filter(x => x.Airport_From == target.value).map(x => x.Airport_To)
    let lastAirportsSortedByName: string[] = [];

    lastAirportsName.forEach(element => {
        if (!lastAirportsSortedByName.includes(element)) { lastAirportsSortedByName.push(element) }
    });
    
    lastAirportsSortedByName.forEach(element => {
        const option = document.createElement('option');
        option.value = `${element}`
        option.innerText = `${element}`
        destinationInputes?.appendChild(option);
    });
});

document.getElementById('destinationDropDownMenuInput')?.addEventListener("change",(event) => { const target = event.target as HTMLSelectElement; To_Airport = target.value; });
document.getElementById('passangersNumber')?.addEventListener("change",(event) => { const target = event.target as HTMLSelectElement; Passangers = Number(target.value); });
document.getElementById('flyingDateData')?.addEventListener("change",(event) => { const target = event.target as HTMLSelectElement; FlyingDateTime = target.value; });

document.getElementById('DoneButton')?.addEventListener("click", (event) => {
    event?.preventDefault()
    AvailablePlanes = AllPlanes.filter(x => x.Airport_From == From_Airport).filter(x => x.Airport_To == To_Airport).filter(x => x.Free_Seats >= Passangers).filter(x => x.Departure_Date >= FlyingDateTime);
    let flightDiv = document.getElementById('fromDiv') as HTMLDivElement;
    flightDiv.innerHTML = "";
    let i = 0;
    savePlanesToStorage(AvailablePlanes);
    AvailablePlanes.forEach(element => {
        let myDiv = document.createElement('div');
        myDiv.innerHTML += `<div class="flight-card">
                <div class="flight-info">
                    <img src="img/Logo_1000_200.png" class="rounded me-3" alt="Airline Logo" width="150">
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
                    <div class="price-details">
                            <div class="price-per-person">Price per person: ${element.Price} EUR</div> 
                            <div class="total-price"><strong>Total price: ${element.Price * Passangers} EUR</strong></div>
                        </div>
                    <a href="reservation.html?departureDate=${element.Departure_Date}&departureTime=${element.Departure_Time}&destinationDate=${element.Destination_Date}&destinationTime=${element.Destination_Time}&airportFrom=${element.Airport_From}&airportTo=${element.Airport_To}&price=${element.Price}&typeOfPlane=${element.Plane_Type}&freeSeats=${element.Free_Seats}&flightNumber=${element.Flight_Number}&passangers=${Passangers}&departureAirport=${element.Airport_From}&destinationAirport=${element.Airport_To}" id="selectedPlane" class="select-button ms-3">Select</a> 
                </div>
            </div>`;
        flightDiv?.appendChild(myDiv);
        i++;
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

export const savePlanesToStorage = (planes: Plane[]) => {
    localStorage.setItem('AvailablePlanes', JSON.stringify(planes));
}
export const getPlanesFromStorage = (): Plane[] => {
    const storedPlanes = localStorage.getItem('AvailablePlanes');
    return storedPlanes ? JSON.parse(storedPlanes) : [];
}
