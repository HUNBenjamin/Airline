//   sor  oszlop oszlopban székek
let planeSeatsList = {
    B737:  [[0, 0, 0], [35, 2, 3]],
    AA320: [[4, 2, 2], [29, 2, 3]],
    AA321: [[5, 2, 2], [34, 2, 3]],
    B777:  [[5, 3, 2], [33, 3, 3]],
    B787:  [[4, 3, 2], [26, 3, 3]],
    AA350: [[8, 3, 2], [31, 3, 3]]
};
  
  
  
  

  
  let data = getQueryParams();
  console.log(data);
  
  const questions = document.getElementById("reservation") as HTMLDivElement;
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
    
    let questionsDiv = document.createElement("div");
    questionsDiv.innerHTML =
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
                <td><a href="#" id="fareSelectButtonFlexiPlus" class="btn">Select Flexi Plus</a></td>
            </tr>
        </table>
    </div>`;
    questions.appendChild(questionsDiv);
}
//const target = event.target as HTMLSelectElement; console.log(target.firstChild!.nodeValue);
document.getElementById("fareSelectButtonBasic")!.addEventListener("click", (event) => { FareCompleated(data.price!, 1); });
document.getElementById("fareSelectButtonRegular")!.addEventListener("click", (event) => { FareCompleated(data.price!, 1.15); });
document.getElementById("fareSelectButtonPlus")!.addEventListener("click", (event) => { FareCompleated(data.price!, 1.35); });
document.getElementById("fareSelectButtonFlexiPlus")!.addEventListener("click", (event) => { FareCompleated(data.price!, 1.5); })

function FareCompleated(realPrice:string , plusPrice: number) {
    data.price = `${(Number(realPrice) * plusPrice)}`;
    limiter = true;
    (document.getElementById("reservation") as HTMLDivElement).innerHTML = '';
    let questionsDiv = document.createElement("div");
    questionsDiv.innerHTML +=
    `<div>
        <h1 class="my-5" >Choosed ✅ </h1>
    </div>`;
    questions.append(questionsDiv);
    console.log(data.price);
    PlaneSeatsMaker(data.typeOfPlane!);
    
    
}

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

function PlaneFinder(PlaneName: string) {
    let data = PlaneName.split(" ")
    let firstData = data[0]
    return `${firstData[0]}${data[1]}`
    
}

function PlaneSeatsMaker(PlaneName: string) {
    let plane = PlaneFinder(PlaneName)
    const planeConfig = Object(planeSeatsList)[plane]
    const planeContainer = document.getElementById("plane");
    
    if (planeContainer && planeConfig) {
        planeContainer.innerHTML = ""; // Clear previous content
        
        // Labels
        const businessLabel = document.createElement("h3");
        businessLabel.textContent = "Business Class";
        planeContainer.appendChild(businessLabel);
        
        // Generate Business Class
        createSeatRows(planeConfig[0], planeContainer, "business", Number(data.freeSeats));

        const economyLabel = document.createElement("h3");
        economyLabel.textContent = "Economy Class";
        planeContainer.appendChild(economyLabel);
        
        // Generate Economy Class
        createSeatRows(planeConfig[1], planeContainer, "economy", Number(data.freeSeats));
    }
}
    

function createSeatRows(config: number[], container: Element, classType: string, emptySeats: number) {
    const [rows, columns, seatsPerColumn] = config;
    let freeSpace = emptySeats
    for (let r = 1; r <= rows; r++) {
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("row");

        for (let c = 0; c < columns; c++) {
            for (let s = 0; s < seatsPerColumn; s++) {
                const seatLabel = `${r}${String.fromCharCode(65 + c * seatsPerColumn + s)}`;
                const seatButton = document.createElement("button");
                seatButton.classList.add("seat", classType);
                seatButton.textContent = seatLabel;

                if (Math.random() < 0.2 && freeSpace > 0) {
                    seatButton.addEventListener("click", () => {
                        if (!seatButton.classList.contains("taken")) {
                            seatButton.classList.toggle("selected");
                        }
                    });
                    freeSpace --;
                }else{
                    seatButton.classList.add("taken");
                    seatButton.disabled = true;
                }

                rowDiv.appendChild(seatButton);
            }
            if (c < columns - 1) {
                const aisle = document.createElement("div");
                aisle.classList.add("aisle");
                rowDiv.appendChild(aisle);
            }
        }

        container.appendChild(rowDiv);
    }
}
