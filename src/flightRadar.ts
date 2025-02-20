import * as Leaflet from "leaflet";
const L = window.L as typeof Leaflet;


// Initialize the map
const map = L.map("map").setView([47.3769, 8.5417], 5); // Center on Europe
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Custom plane icon
const planeIcon = L.icon({
  iconUrl: "../img/flightRadarPlaneIcon.png", // Replace with your plane image
  iconSize: [32, 32], // Adjust as needed
  iconAnchor: [16, 16],
});


interface Flight {
  id: number;
  Departure_Date: string;
  Departure_Time: string;
  Destination_Date: string;
  Destination_Time: string;
  Airport_From: string;
  Airport_To: string;
  Price: number;
  Type_of_plane: string;
  Free_seats: number;
  Flight_Number: string;
}

interface AirportCoordinates{
  name: string;
  lat: number;
  lng: number;
}

async function fetchAirportCoordinates(): Promise<AirportCoordinates[]> {
  try {
      const response = await fetch("http://localhost:3000/airportCoordinates");
      if (!response.ok) throw new Error('Failed to fetch airport coordinates');
      return await response.json();
  } catch (error) {
      console.error('Error fetching airport coordinates:', error);
      return [];
  }
}

async function getAirportCoordinates(airportName: string) {
  const airports = await fetchAirportCoordinates();
  const airport = airports.find(a => a.name === airportName);
  return airport ? { lat: airport.lat, lng: airport.lng } : null;
}

async function fetchFlightsForTracker(): Promise<Flight[]> {
  try {
      const response = await fetch("http://localhost:3000/userFlights");
      if (!response.ok) throw new Error('Failed to fetch user flights');
      return await response.json();
  } catch (error) {
      console.error('Error fetching flights:', error);
      return [];
  }
}

function calculateCurvedPath(start: L.LatLng, end: L.LatLng, segments: number = 100): L.LatLng[] {
  const points: L.LatLng[] = [];
  for (let i = 0; i <= segments; i++) {
      const fraction = i / segments;
      
      // Great circle interpolation
      const lat1 = start.lat * Math.PI / 180;
      const lon1 = start.lng * Math.PI / 180;
      const lat2 = end.lat * Math.PI / 180;
      const lon2 = end.lng * Math.PI / 180;

      const d = 2 * Math.asin(Math.sqrt(
          Math.pow(Math.sin((lat1 - lat2) / 2), 2) +
          Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon1 - lon2) / 2), 2)
      ));

      const A = Math.sin((1 - fraction) * d) / Math.sin(d);
      const B = Math.sin(fraction * d) / Math.sin(d);

      const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
      const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
      const z = A * Math.sin(lat1) + B * Math.sin(lat2);

      const lat = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))) * 180 / Math.PI;
      const lon = Math.atan2(y, x) * 180 / Math.PI;

      points.push(L.latLng(lat, lon));
  }
  return points;
}

// Calculate current position on path
function calculateCurrentPosition(
  departure: number, 
  destination: number, 
  departureLT: number,
  destinationLT: number
): number {
  let flightDuration: number;
  
  // Calculate flight duration considering timezone differences
  if (destination < departure) {
      flightDuration = (24 - departure) + destination;
  } else {
      flightDuration = destination - departure;
  }
  
  // Calculate progress based on local times
  let progress: number;
  const timezoneDiff = destinationLT - departureLT;
  
  if (destination < departure) {
      if (departureLT >= departure) {
          progress = (departureLT - departure) / flightDuration;
      } else {
          progress = ((24 - departure) + departureLT) / flightDuration;
      }
  } else {
      progress = (departureLT - departure + timezoneDiff) / flightDuration;
  }
  
  return Math.max(0, Math.min(1, progress));
}

function getLocalTime(lat: number, lng: number): number {
  // Convert coordinates to timezone offset in hours
  const timeZoneOffset = Math.round(lng / 15);
  const utcTime = new Date();
  const localHour = (utcTime.getUTCHours() + timeZoneOffset + 24) % 24;
  const localMinutes = utcTime.getUTCMinutes();
  return localHour + (localMinutes / 60);
}

async function initializeMap() {
  const flights = await fetchFlightsForTracker();
  let currentVisiblePath: L.Polyline | null = null;

  for (const flight of flights) {
    const departureCoords = await getAirportCoordinates(flight.Airport_From);
    const destinationCoords = await getAirportCoordinates(flight.Airport_To);
    
    if (!departureCoords || !destinationCoords) continue;
    
    const departureLT = getLocalTime(departureCoords.lat, departureCoords.lng);
    const destinationLT = getLocalTime(destinationCoords.lat, destinationCoords.lng);
    
    // Check if flight is currently active based on local times
    const isActive = (departureLT >= parseInt(flight.Departure_Time) && 
                     departureLT <= parseInt(flight.Destination_Time)) ||
                    (parseInt(flight.Destination_Time) < parseInt(flight.Departure_Time) && 
                     (departureLT >= parseInt(flight.Departure_Time) || 
                      departureLT <= parseInt(flight.Destination_Time)));
    
    if (!isActive) continue;
  }

  
  function updatePlanePositions() {
    markers.forEach(({marker, flight, points, departureCoords, destinationCoords}) => {
        const departureLT = getLocalTime(departureCoords.lat, departureCoords.lng);
        const destinationLT = getLocalTime(destinationCoords.lat, destinationCoords.lng);
        
        const progress = calculateCurrentPosition(
            parseInt(flight.Departure_Time),
            parseInt(flight.Destination_Time),
            departureLT,
            destinationLT
        );
        
        const currentPointIndex = Math.floor(progress * (points.length - 1));
        const currentPosition = points[currentPointIndex];
        marker.setLatLng(currentPosition);
    });
}
  
  const markers: Array<{
      marker: L.Marker,
      flight: Flight,
      path: L.Polyline,
      points: L.LatLng[],
      departureCoords: { lat: number, lng: number },
      destinationCoords: { lat: number, lng: number }
  }> = [];
  
  for (const flight of flights) {
      const departureCoords = await getAirportCoordinates(flight.Airport_From);
      const destinationCoords = await getAirportCoordinates(flight.Airport_To);
      
      if (!departureCoords || !destinationCoords) continue;
      
      const curvedPoints = calculateCurvedPath(
          L.latLng(departureCoords.lat, departureCoords.lng),
          L.latLng(destinationCoords.lat, destinationCoords.lng)
      );
      
      const flightPath = L.polyline(curvedPoints, {
          color: 'blue',
          weight: 2,
          opacity: 0
      }).addTo(map);
      
      const planeMarker = L.marker([departureCoords.lat, departureCoords.lng], {
          icon: planeIcon
      }).addTo(map);
      
      planeMarker.on('click', () => {
          if (currentVisiblePath) {
              currentVisiblePath.setStyle({ opacity: 0 });
          }
          flightPath.setStyle({ opacity: 1 });
          currentVisiblePath = flightPath;
          
          planeMarker.bindPopup(
              `<b>Flight Number:</b> ${flight.Flight_Number}<br>
               <b>From:</b> ${flight.Airport_From}<br>
               <b>To:</b> ${flight.Airport_To}<br>
               <b>Departure:</b> ${flight.Departure_Time}:00<br>
               <b>Arrival:</b> ${flight.Destination_Time}:00`
          ).openPopup();
      });
      
      markers.push({
        marker: planeMarker,
        flight: flight,
        path: flightPath,
        points: curvedPoints,
        departureCoords,
        destinationCoords
    });
  }
  
  // Update plane positions every second
  setInterval(updatePlanePositions, 1000);
}

initializeMap();