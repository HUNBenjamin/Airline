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

const map = L.map("map").setView([47.3769, 8.5417], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

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
    let startLng = start.lng;
    let endLng = end.lng;
    
    if (Math.abs(startLng - endLng) > 180) {
        if (startLng < 0) {
            startLng += 360;
        } else {
            endLng += 360;
        }
    }
    
    const adjustedStart = L.latLng(start.lat, startLng);
    const adjustedEnd = L.latLng(end.lat, endLng);

    for (let i = 0; i <= segments; i++) {
        const fraction = i / segments;
        
        const lat1 = adjustedStart.lat * Math.PI / 180;
        const lon1 = adjustedStart.lng * Math.PI / 180;
        const lat2 = adjustedEnd.lat * Math.PI / 180;
        const lon2 = adjustedEnd.lng * Math.PI / 180;

        const d = 2 * Math.asin(Math.sqrt(
            Math.pow(Math.sin((lat1 - lat2) / 2), 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon1 - lon2) / 2), 2)
        ));

        const A = Math.sin((1 - fraction) * d) / Math.sin(d);
        const B = Math.sin(fraction * d) / Math.sin(d);

        const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
        const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
        const z = A * Math.sin(lat1) + B * Math.sin(lat2);

        let lat = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))) * 180 / Math.PI;
        let lng = Math.atan2(y, x) * 180 / Math.PI;
        lng = ((lng + 180) % 360) - 180;

        points.push(L.latLng(lat, lng));
    }
    return points;
}

function calculateHeading(currentPoint: L.LatLng, nextPoint: L.LatLng): number {
  const dx = nextPoint.lng - currentPoint.lng;
  const dy = nextPoint.lat - currentPoint.lat;
  let heading = Math.atan2(dx, dy) * (180 / Math.PI);
  return heading + 90;
}

function calculateCurrentPosition(
  departure: number, 
  destination: number, 
  departureLT: number,
  destinationLT: number
): number {
  let flightDuration: number;
  
  if (destination < departure) {
      flightDuration = (24 - departure) + destination;
  } else {
      flightDuration = destination - departure;
  }
  
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
  const timeZoneOffset = Math.round(lng / 15);
  const utcTime = new Date();
  const localHour = (utcTime.getUTCHours() + timeZoneOffset + 24) % 24;
  const localMinutes = utcTime.getUTCMinutes();
  return localHour + (localMinutes / 60);
}

async function initializeMap() {
  const flights = await fetchFlightsForTracker();
  let currentVisiblePaths: L.LayerGroup | null = null;
  const markers: Array<{
      marker: L.Marker,
      flight: Flight,
      paths: L.LayerGroup,
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
      
      if (progress <= 0 || progress >= 1) continue;
      
      const curvedPoints = calculateCurvedPath(
          L.latLng(departureCoords.lat, departureCoords.lng),
          L.latLng(destinationCoords.lat, destinationCoords.lng)
      );
      
      const currentPointIndex = Math.floor(progress * (curvedPoints.length - 1));
      
      const completedPath = L.polyline(curvedPoints.slice(0, currentPointIndex + 1), {
          color: 'red',
          weight: 2,
          opacity: 0
      }).addTo(map);

      const remainingPath = L.polyline(curvedPoints.slice(currentPointIndex), {
          color: 'blue',
          weight: 2,
          opacity: 0
      }).addTo(map);

      const pathGroup = L.layerGroup([completedPath, remainingPath]);
      
      const currentPosition = curvedPoints[currentPointIndex];
      const nextPointIndex = Math.min(currentPointIndex + 1, curvedPoints.length - 1);

      interface ExtendedMarkerOptions extends L.MarkerOptions {
        rotationAngle?: number;
      }

      const planeMarker = L.marker([currentPosition.lat, currentPosition.lng], {
        icon: planeIcon,
        rotationAngle: calculateHeading(currentPosition, curvedPoints[nextPointIndex])
      } as ExtendedMarkerOptions).addTo(map);
      
      planeMarker.on('click', () => {
          if (currentVisiblePaths) {
              currentVisiblePaths.eachLayer((layer) => {
                  if (layer instanceof L.Polyline) {
                      layer.setStyle({ opacity: 0 });
                  }
              });
          }
          completedPath.setStyle({ opacity: 1 });
          remainingPath.setStyle({ opacity: 1 });
          currentVisiblePaths = pathGroup;
          
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
          paths: pathGroup,
          points: curvedPoints,
          departureCoords,
          destinationCoords
      });
  }
  
  function updatePlanePositions() {
    markers.forEach(({marker, flight, points, departureCoords, destinationCoords, paths}) => {
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
        const heading = calculateHeading(points[currentPointIndex], points[nextPointIndex]);
        
        paths.clearLayers();
        const completedPath = L.polyline(points.slice(0, currentPointIndex + 1), {
            color: 'red',
            weight: 2,
            opacity: paths.getLayers().length > 0 ? 1 : 0
        }).addTo(paths);
        const remainingPath = L.polyline(points.slice(currentPointIndex), {
            color: 'blue',
            weight: 2,
            opacity: paths.getLayers().length > 0 ? 1 : 0
        }).addTo(paths);
        
        marker.setLatLng(currentPosition);
        // @ts-ignore
        marker.setRotationAngle(heading);
    });
  }
  
  setInterval(updatePlanePositions, 1000);
}

initializeMap();
