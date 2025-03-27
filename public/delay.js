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
let con = false;
let AllPlanesDelay = [];
function fetchPlaneDelay() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("http://localhost:3000/userFlights");
        if (!response.ok) {
            throw new Error("Failed to fetch planes");
        }
        const data = yield response.json();
        return data;
    });
}
;
function displayPlaneDelay() {
    return __awaiter(this, arguments, void 0, function* (type = 'all') {
        const plane = yield fetchPlaneDelay();
        const currentDate = getCurrentDateFormatted();
        AllPlanesDelay = plane.filter(x => x.Departure_Date == currentDate);
        let delayTable = document.getElementById('delayTableDiv');
        console.log(AllPlanesDelay);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <th>Indulási idő</th>
            <th>Késés (perc)</th>
            <th>Reptér</th>
            <th>Repülési kód</th>
        `;
        delayTable.appendChild(tr);
        AllPlanesDelay.forEach(element => {
            const tr = document.createElement('tr');
            tr.classList.add("border-bottom");
            tr.classList.add("border-dark");
            tr.innerHTML =
                `
                        <td>${element.Departure_Time}</td>
                        <td class="text-danger">${Math.floor(Math.random() * 20) >= 5 ? Math.floor(Math.random() * 50) : ""}</td>
                        <td>${element.Airport_From}</td>
                        <td>${element.Flight_Number}</td>
                        <hr>
            `;
            delayTable.appendChild(tr);
        });
    });
}
;
displayPlaneDelay();
function getCurrentDateFormatted() {
    const date = new Date();
    return date.toISOString().split('T')[0];
}
