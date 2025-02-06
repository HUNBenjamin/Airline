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
// Utility functions for localStorage management
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
let activeBookingIds = [1, 2, 3];
let allFlights = [];
//activebookingids by all the records in json
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
// Utility function to redirect to a specific page
function redirectToPage(page) {
    window.location.href = page;
}
// Handle login form submission
function handleLogin(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const users = yield fetchUsers();
        const user = users.find((u) => u.email === email && u.password === password);
        if (user) {
            setCurrentUser(user);
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
    console.log("Current user:", currentUser);
    const navbarUsername = document.getElementById('navbar-username');
    console.log("Navbar element:", navbarUsername);
    if (currentUser && navbarUsername) {
        navbarUsername.textContent = currentUser.name;
        console.log("Updated navbar with name:", currentUser.name);
    }
    else {
        if (navbarUsername) {
            navbarUsername.textContent = "User";
            console.log("Reset to default User text");
        }
    }
}
// Handle register form submission
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
        const newUser = { name, phone, email, password, bookings: [] };
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
// Fetch all users
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
// Handle user page interactions
function setupUserPage() {
    const currentUser = getCurrentUser();
    updateNavbarUsername(); // Add this at the start
    if (!currentUser) {
        redirectToPage('./login.html');
        return;
    }
    // Get DOM elements
    const userNameSpan = document.getElementById('user-name');
    const userEmailSpan = document.getElementById('user-email');
    const userPhoneSpan = document.getElementById('user-phone');
    const bookingsList = document.getElementById('bookings-list');
    const logoutButton = document.getElementById('logout-button');
    const editProfileButton = document.getElementById('edit-profile-button');
    const editProfileForm = document.getElementById('edit-profile-form');
    const profileEditForm = document.getElementById('profile-edit-form');
    const cancelEditButton = document.getElementById('cancel-edit');
    // Display user info
    if (userNameSpan)
        userNameSpan.textContent = currentUser.name;
    if (userEmailSpan)
        userEmailSpan.textContent = currentUser.email;
    if (userPhoneSpan)
        userPhoneSpan.textContent = currentUser.phone;
    // Display bookings
    const displayBookings = () => __awaiter(this, void 0, void 0, function* () {
        if (!bookingsList)
            return;
        try {
            const flights = yield fetchFlights();
            console.log("All flights:", flights);
            const activeFlights = flights.filter(flight => activeBookingIds.includes(Number(flight.id)));
            console.log("Active flights:", activeFlights);
            if (activeFlights.length === 0) {
                bookingsList.innerHTML = '<li class="list-group-item">Nincsenek aktív foglalások</li>';
                bookingsList.insertAdjacentHTML('afterend', '<button class="btn btn-primary mt-3" onclick="resetBookings()">Foglalások visszaállítása</button>');
                return;
            }
            const bookingsHTML = activeFlights.map(flight => `
                <li class="list-group-item" id="booking-${flight.id}" style="display: flex; align-items: center;">
                    <div style="flex-grow: 1;">
                        <strong>${flight.Airport_From} - ${flight.Airport_To}</strong><br>
                        ${flight.Departure_Date} ${flight.Departure_Time} - ${flight.Destination_Date} ${flight.Destination_Time}<br>
                        Plane: ${flight.Plane_Type}<br>
                        Price: ${flight.Price} USD<br>
                        <button class="btn btn-danger btn-sm mt-2" onclick="cancelBooking(${flight.id})">Lemondás</button>
                    </div>
                    <img src="${flight.Image}" alt="${flight.Plane_Type}" style="max-width: 200px; margin: 10px;">
                </li>

            `).join('');
            bookingsList.innerHTML = bookingsHTML;
            bookingsList.insertAdjacentHTML('afterend', '<button class="btn btn-primary mt-3" onclick="resetBookings()">Foglalások visszaállítása</button>');
        }
        catch (error) {
            console.error('Error displaying bookings:', error);
            bookingsList.innerHTML = '<li class="list-group-item">Hiba történt a foglalások betöltésekor</li>';
        }
    });
    // Call displayBookings
    displayBookings();
    // Setup profile editing
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
    // Setup logout
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            clearCurrentUser();
            updateNavbarUsername();
            redirectToPage('./login.html');
        });
    }
}
function resetBookings() {
    return __awaiter(this, void 0, void 0, function* () {
        activeBookingIds = [1, 2, 3];
        localStorage.setItem('activeBookings', JSON.stringify(activeBookingIds));
        setupUserPage();
    });
}
function initializeActiveBookings() {
    const savedBookings = localStorage.getItem('activeBookings');
    activeBookingIds = savedBookings ? JSON.parse(savedBookings) : [];
    // For testing, you can initialize with some flights
    if (activeBookingIds.length === 0) {
        activeBookingIds = [1, 2, 3]; // Add some initial bookings
        localStorage.setItem('activeBookings', JSON.stringify(activeBookingIds));
    }
}
// Initialize the page based on contextfunction init() {
function init() {
    fetchallFlightsData();
    initializeActiveBookings();
    updateNavbarUsername(); // Add this line
    if (document.getElementById('login-form')) {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        loginForm.addEventListener('submit', (event) => handleLogin(event));
        registerForm.addEventListener('submit', (event) => handleRegister(event));
    }
    else if (document.getElementById('user-name')) {
        setupUserPage();
    }
    const savedBookings = localStorage.getItem('activeBookings');
    if (savedBookings) {
        activeBookingIds = JSON.parse(savedBookings);
    }
}
// Run initialization
init();
// Utility function to fetch flights (simulating a database fetch)
