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

let con = false;
let AllPlanesDelay: Plane[] = []

async function fetchPlaneDelay() : Promise<Plane[]> {
    const response =  await fetch("http://localhost:3000/userFlights");
    if (!response.ok) {
        throw new Error("Failed to fetch planes");
    }
    const data = await response.json();
    return data;
};

async function displayPlaneDelay(type: string = 'all') {
    const plane = await fetchPlaneDelay();
    const currentDate = getCurrentDateFormatted();
    AllPlanesDelay = plane.filter(x => x.Departure_Date == currentDate);
    let delayTable = document.getElementById('delayTableDiv') as HTMLDivElement
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
            tr.classList.add("border-bottom")
            tr.classList.add("border-dark")
            tr.innerHTML = 
            `
                        <td>${element.Departure_Time}</td>
                        <td class="text-danger">${Math.floor(Math.random()* 20) >= 5 ? Math.floor(Math.random()* 50) : "" }</td>
                        <td>${element.Airport_From}</td>
                        <td>${element.Flight_Number}</td>
                        <hr>
            `
            delayTable.appendChild(tr);
        });

    
      
   
    
   
};


displayPlaneDelay()

    
function getCurrentDateFormatted(): string {
    const date = new Date();
    return date.toISOString().split('T')[0];
}








