"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b, _c;
let AllPlanes;
let From_Airport = "";
let To_Airport = "";
let FlyingDateTime = "";
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
    console.log(departure);
    let lastAirports = AllPlanes.filter(x => x.Airport_From == departure);
    console.log(lastAirports);
    let lastAirportsSorted = [];
    lastAirports.forEach(element => {
        if (!lastAirportsSorted.includes(element)) {
            lastAirportsSorted.push(element);
        }
    });
    lastAirportsSorted.forEach(element => {
        const option = document.createElement('option');
        option.value = `${element.Airport_To}`;
        option.innerText = `${element.Airport_To}`;
        destinationInputes === null || destinationInputes === void 0 ? void 0 : destinationInputes.appendChild(option);
    });
});
(_b = document.getElementById('destinationDropDownMenuInput')) === null || _b === void 0 ? void 0 : _b.addEventListener("change", (event) => {
    const target = event.target;
    To_Airport = target.value;
    AvailablePlanes = AllPlanes.filter(x => x.Airport_From == From_Airport).filter(x => x.Airport_To == To_Airport);
});
(_c = document.getElementById('DoneButton')) === null || _c === void 0 ? void 0 : _c.addEventListener("click", (event) => {
    // event?.preventDefault()
    let flightDiv = document.getElementById('fromDiv');
    flightDiv.innerHTML = "";
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
                    <h3 class="my-auto">${element.Price} Eur</h3    >
                    <!-- <div style="color: red; font-size: 18px;"><strong>Ft25,529</strong></div> -->
                    <button class="select-btn ms-3">Select</button>
                </div>
            </div>`;
        console.log(myDiv);
        flightDiv === null || flightDiv === void 0 ? void 0 : flightDiv.appendChild(myDiv);
    });
});
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
