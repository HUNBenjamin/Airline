var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
window.cancelBooking = cancelBooking;
window.cancelHotelBooking = cancelHotelBooking;
window.resetBookings = resetBookings;
function cancelBooking(flightId) {
    activeBookingIds = activeBookingIds.filter(id => id !== flightId);
    const flightElement = document.getElementById(`booking-${flightId}`);
    if (flightElement) {
        flightElement.remove();
    }
    localStorage.setItem('activeBookings', JSON.stringify(activeBookingIds));
    alert(`Foglalás ${flightId} sikeresen törölve!`);
}
function fetchHotelById(hotelId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`http://localhost:3000/hotels/${hotelId}`);
            if (!response.ok)
                throw new Error('Failed to fetch hotel data');
            return yield response.json();
        }
        catch (error) {
            console.error('Error fetching hotel:', error);
            return null;
        }
    });
}
function cancelHotelBooking(hotelId) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentUser = getCurrentUser();
        if (!currentUser)
            return;
        const hotel = yield fetchHotelById(hotelId);
        if (!hotel) {
            alert('Hiba történt a hotel adatainak lekérésekor.');
            return;
        }
        currentUser.hotelBookings = currentUser.hotelBookings.filter((id) => id !== hotelId);
        setCurrentUser(currentUser);
        try {
            const response = yield fetch(`http://localhost:3000/users/${currentUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentUser),
            });
            if (!response.ok)
                throw new Error('Failed to update user on server');
        }
        catch (error) {
            console.error('Error updating user:', error);
        }
        const hotelElement = document.getElementById(`hotel-booking-${hotelId}`);
        if (hotelElement) {
            hotelElement.remove();
        }
        alert(`A(z) ${hotel.name} hotel foglalása sikeresen törölve!`);
    });
}
export function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}
export function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}
export function clearCurrentUser() {
    localStorage.removeItem('currentUser');
}
let activeBookingIds = [];
let allFlights = [];
function fetchFlights() {
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
const fetchallFlightsData = () => __awaiter(void 0, void 0, void 0, function* () {
    const flights = yield fetchFlights();
    allFlights = flights.map(flight => Number(flight.id));
    localStorage.setItem('activeBookings', JSON.stringify(activeBookingIds));
    return flights;
});
function redirectToPage(page) {
    window.location.href = page;
}
function handleLogin(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const users = yield fetchUsers();
        const user = users.find((u) => u.email === email && u.password === password);
        if (user) {
            try {
                const response = yield fetch(`http://localhost:3000/users/${user.id}`);
                if (!response.ok)
                    throw new Error('Failed to fetch user data');
                const updatedUser = yield response.json();
                setCurrentUser(updatedUser);
            }
            catch (error) {
                console.error('Error fetching user data:', error);
            }
            updateNavbarUsername();
            redirectToPage('./user.html');
        }
        else {
            alert('Hibás email vagy jelszó.');
        }
    });
}
function updateNavbarUsername() {
    const currentUser = getCurrentUser();
    const navbarUsername = document.getElementById('navbar-username');
    if (currentUser && navbarUsername) {
        navbarUsername.textContent = currentUser.name;
    }
    else {
        if (navbarUsername) {
            navbarUsername.textContent = "User";
        }
    }
}
function handleRegister(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const name = document.getElementById('register-name').value;
        const phone = document.getElementById('register-phone').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const users = yield fetchUsers();
        if (users.some((u) => u.email === email)) {
            alert('Az email már használatban van.');
            return;
        }
        const newUser = { name, phone, email, password, bookings: [], hotelBookings: [], guests: 1 };
        try {
            const response = yield fetch("http://localhost:3000/users", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });
            if (!response.ok)
                throw new Error('Failed to register user');
            alert('Regisztráció sikeres! Kérlek jelentkezz be.');
        }
        catch (error) {
            console.error('Hiba a regisztráció során:', error);
        }
    });
}
function fetchUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("http://localhost:3000/users");
            if (!response.ok)
                throw new Error('Failed to fetch users');
            return yield response.json();
        }
        catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    });
}
function setupUserPage() {
    const currentUser = getCurrentUser();
    updateNavbarUsername();
    if (!currentUser) {
        redirectToPage('./login.html');
        return;
    }
    const userNameSpan = document.getElementById('user-name');
    const userEmailSpan = document.getElementById('user-email');
    const userPhoneSpan = document.getElementById('user-phone');
    const bookingsList = document.getElementById('bookings-list');
    const logoutButton = document.getElementById('logout-button');
    const editProfileButton = document.getElementById('edit-profile-button');
    const editProfileForm = document.getElementById('edit-profile-form');
    const profileEditForm = document.getElementById('profile-edit-form');
    const cancelEditButton = document.getElementById('cancel-edit');
    if (userNameSpan)
        userNameSpan.textContent = currentUser.name;
    if (userEmailSpan)
        userEmailSpan.textContent = currentUser.email;
    if (userPhoneSpan)
        userPhoneSpan.textContent = currentUser.phone;
    const displayBookings = () => __awaiter(this, void 0, void 0, function* () {
        if (!bookingsList)
            return;
        try {
            const flights = yield fetchFlights();
            const hotels = yield fetchHotels();
            const activeFlights = flights.filter(flight => activeBookingIds.includes(Number(flight.id))).map(flight => {
                const totalPrice = flight.Price * (currentUser.guests || 1);
                return Object.assign(Object.assign({}, flight), { totalPrice });
            });
            const activeHotels = hotels.filter((hotel) => currentUser.hotelBookings.includes(Number(hotel.id))).map((hotel) => {
                var _a;
                const bookingDates = (_a = currentUser.hotelBookingDates) === null || _a === void 0 ? void 0 : _a[hotel.id];
                if (!bookingDates) {
                    console.error('Nincsenek dátumok ehhez a foglaláshoz:', hotel.id);
                    return null;
                }
                const totalPrice = calculateTotalPrice(hotel.pricePerNight, bookingDates.dateFrom, bookingDates.dateTo, bookingDates.guests || 1);
                return Object.assign(Object.assign({}, hotel), { totalPrice, bookingDates });
            }).filter((hotel) => hotel !== null);
            if (activeFlights.length === 0 && activeHotels.length === 0) {
                bookingsList.innerHTML = '<li class="list-group-item">Nincsenek aktív foglalások</li>';
                bookingsList.insertAdjacentHTML('afterend', '<button class="btn btn-primary mt-3" onclick="resetBookings()">Foglalások visszaállítása</button>');
                return;
            }
            const bookingsHTML = [
                ...activeFlights.map(flight => `
                    <li class="list-group-item" id="booking-${flight.id}" style="display: flex; align-items: center;">
                        <div style="flex-grow: 1;">
                            <strong>${flight.Airport_From} - ${flight.Airport_To}</strong><br>
                            ${flight.Departure_Date} ${flight.Departure_Time} - ${flight.Destination_Date} ${flight.Destination_Time}<br>
                            Plane: ${flight.Plane_Type}<br>
                            <strong>Price: ${flight.totalPrice} EUR</strong><br>
                            <button class="btn btn-danger btn-sm mt-2" onclick="cancelBooking(${flight.id})">Lemondás</button>
                        </div>
                        <img src="${flight.Image}" alt="${flight.Plane_Type}" style="max-width: 200px; margin: 10px;">
                    </li>
                `),
                ...activeHotels.map((hotel) => `
                    <li class="list-group-item" id="hotel-booking-${hotel.id}" style="display: flex; align-items: center;">
                        <div style="flex-grow: 1;">
                            <strong>${hotel.name}</strong><br>
                            ${hotel.city}<br>
                            ${hotel.bookingDates.dateFrom} - ${hotel.bookingDates.dateTo}<br>
                            <strong>Price: ${hotel.totalPrice} EUR</strong><br>
                            <button class="btn btn-danger btn-sm mt-2" onclick="cancelHotelBooking(${hotel.id})">Lemondás</button>
                        </div>
                        <img src="img/hotels/${hotel.id}.jpg" alt="${hotel.name}" style="max-width: 200px; margin: 10px;">
                    </li>
                `)
            ].join('');
            bookingsList.innerHTML = bookingsHTML;
        }
        catch (error) {
            console.error('Error displaying bookings:', error);
            bookingsList.innerHTML = '<li class="list-group-item">Hiba történt a foglalások betöltésekor</li>';
        }
    });
    function fetchHotels() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch("http://localhost:3000/hotels");
                if (!response.ok)
                    throw new Error('Failed to fetch hotels');
                return yield response.json();
            }
            catch (error) {
                console.error('Error fetching hotels:', error);
                return [];
            }
        });
    }
    displayBookings();
    if (editProfileButton) {
        editProfileButton.addEventListener('click', () => {
            if (editProfileForm) {
                document.getElementById('edit-name').value = currentUser.name;
                document.getElementById('edit-email').value = currentUser.email;
                document.getElementById('edit-phone').value = currentUser.phone;
                editProfileForm.style.display = 'block';
            }
        });
    }
    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', () => {
            if (editProfileForm) {
                editProfileForm.style.display = 'none';
            }
        });
    }
    if (profileEditForm) {
        profileEditForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const updatedName = document.getElementById('edit-name').value;
            const updatedEmail = document.getElementById('edit-email').value;
            const updatedPhone = document.getElementById('edit-phone').value;
            currentUser.name = updatedName;
            currentUser.email = updatedEmail;
            currentUser.phone = updatedPhone;
            setCurrentUser(currentUser);
            if (userNameSpan)
                userNameSpan.textContent = updatedName;
            if (userEmailSpan)
                userEmailSpan.textContent = updatedEmail;
            if (userPhoneSpan)
                userPhoneSpan.textContent = updatedPhone;
            if (editProfileForm) {
                editProfileForm.style.display = 'none';
            }
            alert('Profil sikeresen frissítve!');
        });
    }
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            clearCurrentUser();
            updateNavbarUsername();
            redirectToPage('./login.html');
        });
    }
}
export function addBooking(flightId) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert('Kérlek, először jelentkezz be!');
            redirectToPage('./login.html');
            return;
        }
        if (!currentUser.bookings) {
            currentUser.bookings = [];
        }
        currentUser.bookings.push(flightId);
        try {
            const response = yield fetch(`http://localhost:3000/users/${currentUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentUser),
            });
            if (!response.ok)
                throw new Error('Failed to update user on server');
            activeBookingIds.push(flightId);
            localStorage.setItem('activeBookings', JSON.stringify(activeBookingIds));
            alert('Foglalás sikeres!');
            redirectToPage('./user.html');
        }
        catch (error) {
            console.error('Error updating user:', error);
            alert('Hiba történt a foglalás során.');
        }
    });
}
function resetBookings() {
    return __awaiter(this, void 0, void 0, function* () {
        activeBookingIds = [];
        const currentUser = getCurrentUser();
        if (currentUser) {
            currentUser.hotelBookings = [];
            setCurrentUser(currentUser);
        }
        localStorage.setItem('activeBookings', JSON.stringify(activeBookingIds));
        setupUserPage();
    });
}
function initializeActiveBookings() {
    const savedBookings = localStorage.getItem('activeBookings');
    activeBookingIds = savedBookings ? JSON.parse(savedBookings) : [];
    const currentUser = getCurrentUser();
    if (currentUser && !currentUser.hotelBookings) {
        currentUser.hotelBookings = [];
        setCurrentUser(currentUser);
    }
    if (activeBookingIds.length === 0) {
        activeBookingIds = [];
        localStorage.setItem('activeBookings', JSON.stringify(activeBookingIds));
    }
}
function init() {
    fetchallFlightsData();
    initializeActiveBookings();
    updateNavbarUsername();
    if (document.getElementById('login-form')) {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        loginForm.addEventListener('submit', (event) => handleLogin(event));
        registerForm.addEventListener('submit', (event) => handleRegister(event));
    }
    else if (document.getElementById('user-name')) {
        setupUserPage();
    }
}
init();
function calculateTotalPrice(pricePerNight, dateFrom, dateTo, guests) {
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    const timeDiff = toDate.getTime() - fromDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return pricePerNight * nights * guests;
}
