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
        let departureInputes = document.getElementById('departureDropDownMenuInput');
        citiesFrom.forEach(element => {
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
    lastAirports.forEach(element => {
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
                    <img src="img/Logo_1000-1000.png" alt="Airline Logo" width="150">
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
        flightDiv === null || flightDiv === void 0 ? void 0 : flightDiv.appendChild(myDiv);
    });
});
