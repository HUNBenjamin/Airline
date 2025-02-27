var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b, _c, _d, _e;
let AllPlanes;
let From_Airport = "";
let To_Airport = "";
let Passangers = 1;
let FlyingDateTime = "2025-03-19";
let AvailablePlanes;
function fetchPlane() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("http://localhost:3000/userFlights");
        if (!response.ok) {
            throw new Error("Failed to fetch planes");
        }
        const data = yield response.json();
        return data;
    });
}
function displayPlane() {
    return __awaiter(this, arguments, void 0, function* (type = 'all') {
        const plane = yield fetchPlane();
        AllPlanes = plane;
        let citiesFrom = plane.map(x => x.Airport_From);
        let AirportFromSorted = [];
        citiesFrom.forEach(element => {
            if (!AirportFromSorted.includes(element)) {
                AirportFromSorted.push(element);
            }
        });
        let departureInputes = document.getElementById('departureDropDownMenuInput');
        AirportFromSorted.forEach(element => {
            const option = document.createElement('option');
            option.value = `${element}`;
            option.innerText = `${element}`;
            departureInputes === null || departureInputes === void 0 ? void 0 : departureInputes.appendChild(option);
        });
    });
}
displayPlane();
(_a = document.getElementById('departureDropDownMenuInput')) === null || _a === void 0 ? void 0 : _a.addEventListener("change", (event) => {
    let destinationInputes = document.getElementById('destinationDropDownMenuInput');
    const target = event.target;
    let departure = target.value;
    From_Airport = departure;
    let lastAirports = AllPlanes.filter(x => x.Airport_From == departure);
    let lastAirportsName = lastAirports.map(x => x.Airport_To);
    let lastAirportsSortedByName = [];
    lastAirportsName.forEach(element => {
        if (!lastAirportsSortedByName.includes(element)) {
            lastAirportsSortedByName.push(element);
        }
    });
    lastAirportsSortedByName.forEach(element => {
        const option = document.createElement('option');
        option.value = `${element}`;
        option.innerText = `${element}`;
        destinationInputes === null || destinationInputes === void 0 ? void 0 : destinationInputes.appendChild(option);
    });
});
(_b = document.getElementById('destinationDropDownMenuInput')) === null || _b === void 0 ? void 0 : _b.addEventListener("change", (event) => {
    const target = event.target;
    To_Airport = target.value;
});
(_c = document.getElementById('passangersNumber')) === null || _c === void 0 ? void 0 : _c.addEventListener("change", (event) => {
    const target = event.target;
    let x = target.value;
    Passangers = +x;
});
(_d = document.getElementById('flyingDateData')) === null || _d === void 0 ? void 0 : _d.addEventListener("change", (event) => {
    const target = event.target;
    FlyingDateTime = target.value;
});
export const savePlanesToStorage = (planes) => {
    localStorage.setItem('AvailablePlanes', JSON.stringify(planes));
};
export const getPlanesFromStorage = () => {
    const storedPlanes = localStorage.getItem('AvailablePlanes');
    return storedPlanes ? JSON.parse(storedPlanes) : [];
};
(_e = document.getElementById('DoneButton')) === null || _e === void 0 ? void 0 : _e.addEventListener("click", (event) => {
    event === null || event === void 0 ? void 0 : event.preventDefault();
    AvailablePlanes = AllPlanes.filter(x => x.Airport_From == From_Airport).filter(x => x.Airport_To == To_Airport).filter(x => x.Free_Seats >= Passangers).filter(x => x.Departure_Date >= FlyingDateTime);
    let flightDiv = document.getElementById('fromDiv');
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
        flightDiv === null || flightDiv === void 0 ? void 0 : flightDiv.appendChild(myDiv); //&destination=London&date=2025-03-20&passengers=2
        i++;
    });
});
// let flightDiv = document.getElementById('fromDiv') as HTMLDivElement;
// });
function calculator(a, b) {
    let time1 = a.split(':');
    let time2 = b.split(':');
    if (Number(time1[0]) > Number(time2[0])) {
        return 24 - Number(time1[0]) + Number(time2[0]);
    }
    else {
        return Number(time2[0]) - Number(time1[0]);
    }
}
