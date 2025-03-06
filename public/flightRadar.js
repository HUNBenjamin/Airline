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
const map = L.map("map").setView([47.3769, 8.5417], 5);
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
    let startLng = start.lng;
    let endLng = end.lng;
    if (Math.abs(startLng - endLng) > 180) {
        if (startLng < 0) {
            startLng += 360;
        }
        else {
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
        const d = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((lat1 - lat2) / 2), 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon1 - lon2) / 2), 2)));
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
function calculateHeading(currentPoint, nextPoint) {
    const dx = nextPoint.lng - currentPoint.lng;
    const dy = nextPoint.lat - currentPoint.lat;
    let heading = Math.atan2(dx, dy) * (180 / Math.PI);
    return heading + 90;
}
function calculateCurrentPosition(departure, destination, departureLT, destinationLT) {
    let flightDuration;
    if (destination < departure) {
        flightDuration = (24 - departure) + destination;
    }
    else {
        flightDuration = destination - departure;
    }
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
    const timeZoneOffset = Math.round(lng / 15);
    const utcTime = new Date();
    const localHour = (utcTime.getUTCHours() + timeZoneOffset + 24) % 24;
    const localMinutes = utcTime.getUTCMinutes();
    return localHour + (localMinutes / 60);
}
function initializeMap() {
    return __awaiter(this, void 0, void 0, function* () {
        const flights = yield fetchFlightsForTracker();
        let currentVisiblePaths = null;
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
            const planeMarker = L.marker([currentPosition.lat, currentPosition.lng], {
                icon: planeIcon,
                rotationAngle: calculateHeading(currentPosition, curvedPoints[nextPointIndex])
            }).addTo(map);
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
                planeMarker.bindPopup(`<b>Flight Number:</b> ${flight.Flight_Number}<br>
               <b>From:</b> ${flight.Airport_From}<br>
               <b>To:</b> ${flight.Airport_To}<br>
               <b>Departure:</b> ${flight.Departure_Time}:00<br>
               <b>Arrival:</b> ${flight.Destination_Time}:00`).openPopup();
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
            markers.forEach(({ marker, flight, points, departureCoords, destinationCoords, paths }) => {
                const departureLT = getLocalTime(departureCoords.lat, departureCoords.lng);
                const destinationLT = getLocalTime(destinationCoords.lat, destinationCoords.lng);
                const progress = calculateCurrentPosition(parseInt(flight.Departure_Time), parseInt(flight.Destination_Time), departureLT, destinationLT);
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
    });
}
initializeMap();
export {};
