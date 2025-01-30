var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
;
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
function fetchPlanes() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("http://localhost:3000/userFlights");
        if (!response.ok) {
            throw new Error("Failed to fetch planes");
        }
        const data = yield response.json();
        return data;
    });
}
function displayPlanes() {
    return __awaiter(this, arguments, void 0, function* (type = 'all') {
        const plane = yield fetchPlanes();
        let citiesFrom = plane.map(x => x.Airport_From);
        let departureInputes = document.getElementById('departureDropDownMenuInput');
        citiesFrom.forEach(element => {
            const option = document.createElement('option');
            option.value = `${element}`;
            option.innerText = `${element}`;
            console.log('1');
            departureInputes === null || departureInputes === void 0 ? void 0 : departureInputes.appendChild(option);
            //Honnan mennek kiszedése illetve hova mehetsz beleírása
        });
    });
}
displayPlanes();
export {};
// let filteredPlanes : Plane[] = [];
