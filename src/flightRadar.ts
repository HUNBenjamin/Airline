import * as Leaflet from "leaflet";
const L = window.L as typeof Leaflet;

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



// Initialize the map
const map = L.map("map").setView([47.3769, 8.5417], 5); // Center on Europe
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Custom plane icon
interface ExtendedIconOptions extends L.IconOptions {
  rotationOrigin?: string;
}

const planeIcon = L.icon({
  iconUrl: "../img/flightRadarPlaneIcon.png",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  rotationOrigin: 'center center'
} as ExtendedIconOptions);

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
function calculateHeading(start: L.LatLng, end: L.LatLng): number {
  const startLat = start.lat * Math.PI / 180;
  const startLng = start.lng * Math.PI / 180;
  const endLat = end.lat * Math.PI / 180;
  const endLng = end.lng * Math.PI / 180;

  const dLng = endLng - startLng;

  const y = Math.sin(dLng) * Math.cos(endLat);
  const x = Math.cos(startLat) * Math.sin(endLat) -
           Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
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
  const markers: Array<{
      marker: L.Marker,
      flight: Flight,
      path: L.Polyline,
      points: L.LatLng[],
      departureCoords: {lat: number, lng: number},
      destinationCoords: {lat: number, lng: number}
  }> = [];
  
  for (const flight of flights) {
      const departureCoords = await getAirportCoordinates(flight.Airport_From);
      const destinationCoords = await getAirportCoordinates(flight.Airport_To);
      
      if (!departureCoords || !destinationCoords) continue;
      
      const departureLT = getLocalTime(departureCoords.lat, departureCoords.lng);
      const destinationLT = getLocalTime(destinationCoords.lat, destinationCoords.lng);
      
      const progress = calculateCurrentPosition(
          parseInt(flight.Departure_Time),
          parseInt(flight.Destination_Time),
          departureLT,
          destinationLT
      );
      
      //if (progress <= 0 || progress >= 1) continue;
      
      const curvedPoints = calculateCurvedPath(
        L.latLng(departureCoords.lat, departureCoords.lng),
        L.latLng(destinationCoords.lat, destinationCoords.lng),
        200  // Increase segments for smoother curves
    );
      
    const flightPath = L.polyline(curvedPoints, {
      color: 'blue',
      weight: 2,
      opacity: 0,
      smoothFactor: 1
    }).addTo(map);
      
    const currentPointIndex = Math.floor(progress * (curvedPoints.length - 1));
    const nextPointIndex = Math.min(currentPointIndex + 1, curvedPoints.length - 1);
    const currentPosition = curvedPoints[currentPointIndex];
    const heading = calculateHeading(currentPosition, curvedPoints[nextPointIndex]);

        const marker = L.marker(currentPosition, {
            icon: planeIcon
        }).addTo(map);

        const icon = marker.getElement();
        if (icon) {
            icon.style.transform += ` rotate(${heading}deg)`;
        }
      
      marker.on('click', () => {
          if (currentVisiblePath) {
              currentVisiblePath.setStyle({ opacity: 0 });
          }
          flightPath.setStyle({ opacity: 1 });
          currentVisiblePath = flightPath;
          
          marker.bindPopup(
              `<b>Flight Number:</b> ${flight.Flight_Number}<br>
               <b>From:</b> ${flight.Airport_From}<br>
               <b>To:</b> ${flight.Airport_To}<br>
               <b>Departure:</b> ${flight.Departure_Time}:00<br>
               <b>Arrival:</b> ${flight.Destination_Time}:00`
          ).openPopup();
      });
      
      markers.push({
          marker: marker,
          flight: flight,
          path: flightPath,
          points: curvedPoints,
          departureCoords,
          destinationCoords
      });
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
          const nextPointIndex = Math.min(currentPointIndex + 1, points.length - 1);
          const currentPosition = points[currentPointIndex];
          const heading = calculateHeading(currentPosition, points[nextPointIndex]);
          
          marker.setLatLng(currentPosition);
          const icon = marker.getElement();
          if (icon) {
              icon.style.transform = `translate3d(0,0,0) rotate(${heading}deg)`;
          }
      });
  }
  
  setInterval(updatePlanePositions, 1000);
}


initializeMap();