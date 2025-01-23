var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
            redirectToPage('./user.html');
        }
        else {
            alert('Hibás email vagy jelszó.');
        }
    });
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
function loadFlights() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('userFlights.json');
            const data = yield response.json();
            const flightsContainer = document.getElementById('flights-container');
            data.userFlights.forEach((flight) => {
                const flightCard = document.createElement('div');
                flightCard.className = 'col-md-6 col-lg-4 mb-3 w-100';
                flightCard.innerHTML = `
                <div class="card w-100 h-100" id="flight-${flight.id}">
                    <div class="card-body">
                        <h5 class="card-title">${flight.Airport_From} - ${flight.Airport_To}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">Járatszám: ${flight['Flight Number']}</h6>
                        <p class="card-text">
                            <strong>Indulás:</strong> ${flight.Departure_Date} ${flight.Departure_Time}<br>
                            <strong>Érkezés:</strong> ${flight.Destination_Date} ${flight.Destination_Time}<br>
                            <strong>Repülőgép:</strong> ${flight.Plane_Type}<br>
                            <strong>Szabad helyek:</strong> ${flight['Free Seats']}<br>
                            <strong>Ár:</strong> ${flight.Price} EUR
                        </p>
                        <button class="btn btn-danger" onclick="cancelFlight(${flight.id})">
                            Lemondás
                        </button>
                    </div>
                </div>
            `;
                flightsContainer === null || flightsContainer === void 0 ? void 0 : flightsContainer.appendChild(flightCard);
            });
        }
        catch (error) {
            console.error('Error loading flights:', error);
        }
    });
}
function cancelFlight(flightId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Eltávolítjuk a járatot a DOM-ból
        const flightCard = document.getElementById(`flight-${flightId}`);
        flightCard === null || flightCard === void 0 ? void 0 : flightCard.remove();
        try {
            // Kiszűrjük az eltávolítani kívánt járatot a listából
            const response = yield fetch('userFlights.json');
            const data = yield response.json();
            const updatedFlights = data.userFlights.filter((flight) => flight.id !== flightId);
            // Töröljük a járatot a JSON fájlból (backend API-val)
            const updateResponse = yield fetch('http://localhost:3000/userFlights', {
                method: 'PUT', // Vagy 'PATCH' attól függően, hogy hogyan kezeli a backend
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userFlights: updatedFlights })
            });
            if (!updateResponse.ok) {
                console.error('Hiba a járat törlésekor.');
            }
        }
        catch (error) {
            console.error('Hiba a járatok frissítésekor:', error);
        }
    });
}
// Handle user page interactions
function setupUserPage() {
    const currentUser = getCurrentUser();
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
    // Populate user details
    userNameSpan.textContent = currentUser.name;
    userEmailSpan.textContent = currentUser.email;
    userPhoneSpan.textContent = currentUser.phone;
    bookingsList.innerHTML = (currentUser.bookings || [])
        .map((booking) => `<li class="list-group-item">${booking}</li>`)
        .join('');
    // Edit profile functionality
    editProfileButton.addEventListener('click', () => {
        document.getElementById('edit-name').value = currentUser.name;
        document.getElementById('edit-email').value = currentUser.email;
        document.getElementById('edit-phone').value = currentUser.phone;
        editProfileForm.style.display = 'block';
    });
    cancelEditButton.addEventListener('click', () => {
        editProfileForm.style.display = 'none';
    });
    profileEditForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const updatedName = document.getElementById('edit-name').value;
        const updatedEmail = document.getElementById('edit-email').value;
        const updatedPhone = document.getElementById('edit-phone').value;
        // Update user data
        currentUser.name = updatedName;
        currentUser.email = updatedEmail;
        currentUser.phone = updatedPhone;
        setCurrentUser(currentUser);
        // Update UI
        userNameSpan.textContent = updatedName;
        userEmailSpan.textContent = updatedEmail;
        userPhoneSpan.textContent = updatedPhone;
        editProfileForm.style.display = 'none';
        alert('Profil sikeresen frissítve!');
    });
    // Logout functionality
    logoutButton.addEventListener('click', () => {
        clearCurrentUser();
        redirectToPage('./login.html');
    });
}
// Initialize the page based on context
function init() {
    if (document.getElementById('login-form')) {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        loginForm.addEventListener('submit', handleLogin);
        registerForm.addEventListener('submit', handleRegister);
    }
    else if (document.getElementById('user-name')) {
        setupUserPage();
    }
}
// Add this to window load event
window.addEventListener('load', loadFlights);
// Run initialization
init();
