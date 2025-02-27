  let data = getQueryParams();
  const questions = document.getElementById("reservationQuestions") as HTMLDivElement;
  let limiter = false;
  let flightDiv = document.getElementById("reservationData") as HTMLDivElement;
  let myDiv = document.createElement("div");
  myDiv.innerHTML += 
    `<div class="flight-card">
        <div class="flight-info">
            <img src="img/Logo_1000_200.png" class="rounded me-3" alt="Airline Logo" width="150">
            <div id="flightFromDataFill" class="flight-time">
                <strong>${data.departureTime}</strong>
                <span>${data.departureAirport}</span>
            </div>
            <div id="flightCodeAndNumberFill" class="flight-time">
                ✈ ${data.flightNumber}
                <span>${calculator(data.departureTime!, data.destinationTime!)} h</span>
            </div>
            <div id="flightToDataFill" class="flight-time">
                <strong>${data.destinationTime}</strong>
                <span>${data.destinationAirport}</span>
            </div>
        </div>
        <div id="filghtPriceFill" class="flight-price">
            <div class="price-details">
                <div class="price-per-person">Price per person: ${data.price} EUR</div> 
                <div class="total-price"><strong>Total price: ${stringToInt(data.price!,data.passangers!)} EUR</strong></div>
            </div>
        </div>
    </div>`;
    flightDiv?.appendChild(myDiv);
if (limiter == false) {
    console.log("Kész");
    
    let questionsDiv = document.createElement("div");
    questionsDiv.innerHTML +=
    `<div>
        <h1>Choose Your Fare</h1>
        <table class="fare-table">
            <tr>
                <th>Basic</th>
                <th>Regular</th>
                <th>Plus</th>
                <th>Flexi Plus</th>
            </tr>
            <tr>
                <td>1 small bag ✅</td>
                <td>1 small bag + 10kg overhead ✅</td>
                <td>10kg + 20kg check-in ✅</td>
                <td>All bags + Fast Track ✅</td>
            </tr>
            <tr>
                <td>No reserved seat ❌</td>
                <td>Specific seat selection ✅</td>
                <td>Specific seat selection ✅</td>
                <td>Any seat on the plane ✅</td>
            </tr>
            <tr>
                <td>No priority boarding ❌</td>
                <td>Priority boarding ✅</td>
                <td>Priority boarding ✅</td>
                <td>Priority + Fast Track ✅</td>
            </tr>
            <tr>
                <td><strong>${data.price} EUR</strong></td>
                <td><strong>${RandomPrica(data.passangers!, data.price!, 1.15)} EUR</strong></td>
                <td><strong>${RandomPrica(data.passangers!, data.price!, 1.35)} EUR</strong></td>
                <td><strong>${RandomPrica(data.passangers!, data.price!, 1.5)} EUR</strong></td>
            </tr>
            <tr>
                <td><a href="#" id="fareSelectButtonBasic" class="btn">Select Basic</a></td>
                <td><a href="#" id="fareSelectButtonRegular" class="btn">Select Regular</a></td>
                <td><a href="#" id="fareSelectButtonPlus" class="btn">Select Plus</a></td>
                <td><a href="#" id="fareSelectButtonFlexiP" class="btn">Select Flexi Plus</a></td>
            </tr>
        </table>
    </div>`;
    questions.appendChild(questionsDiv);
}
document.getElementById("fareSelectButtonBasic")!.addEventListener("click", () => {
    limiter = true;
    (document.getElementById("reservationQuestions") as HTMLDivElement).innerHTML = '';
    let questionsDiv = document.createElement("div");
    questionsDiv.innerHTML +=
    `<div>
        <h1 class="my-5" >Choosed ✅ </h1>
    </div>`;
    console.log("Basic");
    questions.append(questionsDiv);

})

function stringToInt(a: string, b: string) {
  return Number(a) * Number(b);
}
function RandomPrica(a: string, b: string, c: number) {
    return Math.round(((Number(a) * Number(b)) * c )); 
}
function calculator(a: string, b: string) {
  let time1 = a.split(":");
  let time2 = b.split(":");
  if (Number(time1[0]) > Number(time2[0])) {
    return 24 - Number(time1[0]) + Number(time2[0]);
  } else {
    return Number(time2[0]) - Number(time1[0]);
  }
}

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    departureDate: params.get("departureDate"),
    departureTime: params.get("departureTime"),
    destinationDate: params.get("destinationDate"),
    destinationTime: params.get("destinationTime"),
    departureAirport: params.get("departureAirport"),
    destinationAirport: params.get("destinationAirport"),
    price: params.get("price"),
    typeOfPlane: params.get("typeOfPlane"),
    freeSeats: params.get("freeSeats"),
    flightNumber: params.get("flightNumber"),
    passangers: params.get("passangers"),
  };
}
