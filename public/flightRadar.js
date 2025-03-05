var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const L = window.L;
// Initialize the map
const map = L.map("map").setView([47.3769, 8.5417], 5); // Center on Europe
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);
const planeIcon = L.icon({
    iconUrl: "../img/flightRadarPlaneIcon.png",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    rotationOrigin: 'center center'
});
function fetchAirportCoordinates() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("http://localhost:3000/airportCoordinates");
            if (!response.ok)
                throw new Error('Failed to fetch airport coordinates');
            return yield response.json();
        }
        catch (error) {
            console.error('Error fetching airport coordinates:', error);
            return [];
        }
    });
}
function getAirportCoordinates(airportName) {
    return __awaiter(this, void 0, void 0, function* () {
        const airports = yield fetchAirportCoordinates();
        const airport = airports.find(a => a.name === airportName);
        return airport ? { lat: airport.lat, lng: airport.lng } : null;
    });
}
function fetchFlightsForTracker() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("http://localhost:3000/userFlights");
            if (!response.ok)
                throw new Error('Failed to fetch user flights');
            return yield response.json();
        }
        catch (error) {
            console.error('Error fetching flights:', error);
            return [];
        }
    });
}
function calculateCurvedPath(start, end, segments = 100) {
    const points = [];
    for (let i = 0; i <= segments; i++) {
        const fraction = i / segments;
        // Great circle interpolation
        const lat1 = start.lat * Math.PI / 180;
        const lon1 = start.lng * Math.PI / 180;
        const lat2 = end.lat * Math.PI / 180;
        const lon2 = end.lng * Math.PI / 180;
        const d = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((lat1 - lat2) / 2), 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon1 - lon2) / 2), 2)));
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
function calculateHeading(currentPoint, nextPoint) {
    const dx = nextPoint.lng - currentPoint.lng;
    const dy = nextPoint.lat - currentPoint.lat;
    let heading = Math.atan2(dx, dy) * (180 / Math.PI);
    // Adjust heading to match plane icon's default orientation
    return heading + 90;
}
// Calculate current position on path
function calculateCurrentPosition(departure, destination, departureLT, destinationLT) {
    let flightDuration;
    // Calculate flight duration considering timezone differences
    if (destination < departure) {
        flightDuration = (24 - departure) + destination;
    }
    else {
        flightDuration = destination - departure;
    }
    // Calculate progress based on local times
    let progress;
    const timezoneDiff = destinationLT - departureLT;
    if (destination < departure) {
        if (departureLT >= departure) {
            progress = (departureLT - departure) / flightDuration;
        }
        else {
            progress = ((24 - departure) + departureLT) / flightDuration;
        }
    }
    else {
        progress = (departureLT - departure + timezoneDiff) / flightDuration;
    }
    return Math.max(0, Math.min(1, progress));
}
function getLocalTime(lat, lng) {
    // Convert coordinates to timezone offset in hours
    const timeZoneOffset = Math.round(lng / 15);
    const utcTime = new Date();
    const localHour = (utcTime.getUTCHours() + timeZoneOffset + 24) % 24;
    const localMinutes = utcTime.getUTCMinutes();
    return localHour + (localMinutes / 60);
}
function initializeMap() {
    return __awaiter(this, void 0, void 0, function* () {
        const flights = yield fetchFlightsForTracker();
        let currentVisiblePath = null;
        const markers = [];
        for (const flight of flights) {
            const departureCoords = yield getAirportCoordinates(flight.Airport_From);
            const destinationCoords = yield getAirportCoordinates(flight.Airport_To);
            if (!departureCoords || !destinationCoords)
                continue;
            const departureLT = getLocalTime(departureCoords.lat, departureCoords.lng);
            const destinationLT = getLocalTime(destinationCoords.lat, destinationCoords.lng);
            const progress = calculateCurrentPosition(parseInt(flight.Departure_Time), parseInt(flight.Destination_Time), departureLT, destinationLT);
            if (progress <= 0 || progress >= 1)
                continue;
            const curvedPoints = calculateCurvedPath(L.latLng(departureCoords.lat, departureCoords.lng), L.latLng(destinationCoords.lat, destinationCoords.lng));
            const flightPath = L.polyline(curvedPoints, {
                color: 'blue',
                weight: 2,
                opacity: 0
            }).addTo(map);
            const currentPointIndex = Math.floor(progress * (curvedPoints.length - 1));
            const nextPointIndex = Math.min(currentPointIndex + 1, curvedPoints.length - 1);
            const currentPosition = curvedPoints[currentPointIndex];
            const planeMarker = L.marker([currentPosition.lat, currentPosition.lng], {
                icon: planeIcon,
                rotationAngle: calculateHeading(currentPosition, curvedPoints[nextPointIndex])
            }).addTo(map);
            planeMarker.on('click', () => {
                if (currentVisiblePath) {
                    currentVisiblePath.setStyle({ opacity: 0 });
                }
                flightPath.setStyle({ opacity: 1 });
                currentVisiblePath = flightPath;
                planeMarker.bindPopup(`<b>Flight Number:</b> ${flight.Flight_Number}<br>
               <b>From:</b> ${flight.Airport_From}<br>
               <b>To:</b> ${flight.Airport_To}<br>
               <b>Departure:</b> ${flight.Departure_Time}:00<br>
               <b>Arrival:</b> ${flight.Destination_Time}:00`).openPopup();
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
        function updatePlanePositions() {
            markers.forEach(({ marker, flight, points, departureCoords, destinationCoords }) => {
                const departureLT = getLocalTime(departureCoords.lat, departureCoords.lng);
                const destinationLT = getLocalTime(destinationCoords.lat, destinationCoords.lng);
                const progress = calculateCurrentPosition(parseInt(flight.Departure_Time), parseInt(flight.Destination_Time), departureLT, destinationLT);
                const currentPointIndex = Math.floor(progress * (points.length - 1));
                const nextPointIndex = Math.min(currentPointIndex + 1, points.length - 1);
                const currentPosition = points[currentPointIndex];
                const heading = calculateHeading(points[currentPointIndex], points[nextPointIndex]);
                marker.setLatLng(currentPosition);
                // @ts-ignore - Leaflet typings don't include setRotationAngle
                marker.setRotationAngle(heading);
            });
        }
        setInterval(updatePlanePositions, 1000);
    });
}
initializeMap();
export {};
