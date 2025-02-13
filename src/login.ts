(window as any).cancelBooking = cancelBooking;
(window as any).resetBookings = resetBookings;

function cancelBooking(flightId: number) {
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

export function setCurrentUser(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

export function clearCurrentUser() {
    localStorage.removeItem('currentUser');
}

let activeBookingIds: number[] = [1, 2, 3];
let allFlights: number[] = [];

//activebookingids by all the records in json
async function fetchFlights(): Promise<any[]> {
    try {
        const response = await fetch("http://localhost:3000/userFlights");
        if (!response.ok) throw new Error('Failed to fetch user flights');
        return await response.json();
        
    } catch (error) {
        console.error('Error fetching flights:', error);
        return [];
    }
}

const fetchallFlightsData = async () => {
    const flights = await fetchFlights();
    allFlights = flights.map(flight => Number(flight.id));
    localStorage.setItem('activeBookings', JSON.stringify(activeBookingIds));
    return flights;
};

// Utility function to redirect to a specific page
function redirectToPage(page: string) {
    window.location.href = page;
}

// Handle login form submission
async function handleLogin(event: SubmitEvent) {
    event.preventDefault();
    const email = (document.getElementById('login-email') as HTMLInputElement).value;
    const password = (document.getElementById('login-password') as HTMLInputElement).value;

    const users = await fetchUsers();
    const user = users.find((u: { email: string; password: string }) => u.email === email && u.password === password);

    if (user) {
        setCurrentUser(user);
        updateNavbarUsername();
        redirectToPage('./user.html');
        
    } else {
        alert('Hibás email vagy jelszó.');
    }
}

function updateNavbarUsername() {
    const currentUser = getCurrentUser();
    const navbarUsername = document.getElementById('navbar-username');
    
    if (currentUser && navbarUsername) {
        navbarUsername.textContent = currentUser.name;
    } else {
        if (navbarUsername) {
            navbarUsername.textContent = "User";
        }
    }
}



// Handle register form submission
async function handleRegister(event: SubmitEvent) {
    event.preventDefault();
    const name = (document.getElementById('register-name') as HTMLInputElement).value;
    const phone = (document.getElementById('register-phone') as HTMLInputElement).value;
    const email = (document.getElementById('register-email') as HTMLInputElement).value;
    const password = (document.getElementById('register-password') as HTMLInputElement).value;

    const users = await fetchUsers();
    if (users.some((u: { email: string }) => u.email === email)) {
        alert('Az email már használatban van.');
        return;
    }

    const newUser = { name, phone, email, password, bookings: [] };
    try {
        const response = await fetch("http://localhost:3000/users", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser),
        });

        if (!response.ok) throw new Error('Failed to register user');
        alert('Regisztráció sikeres! Kérlek jelentkezz be.');
    } catch (error) {
        console.error('Hiba a regisztráció során:', error);
    }
}

// Fetch all users
async function fetchUsers(): Promise<any[]> {
    try {
        const response = await fetch("http://localhost:3000/users");
        if (!response.ok) throw new Error('Failed to fetch users');
        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
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
    if (userNameSpan) userNameSpan.textContent = currentUser.name;
    if (userEmailSpan) userEmailSpan.textContent = currentUser.email;
    if (userPhoneSpan) userPhoneSpan.textContent = currentUser.phone;

    // Display bookings
    const displayBookings = async () => {
        if (!bookingsList) return;
    
        try {
            const flights = await fetchFlights();
            console.log("All flights:", flights);
    
            const activeFlights = flights.filter(flight => 
                activeBookingIds.includes(Number(flight.id))
            );
            console.log("Active flights:", activeFlights);
    
            if (activeFlights.length === 0) {
                bookingsList.innerHTML = '<li class="list-group-item">Nincsenek aktív foglalások</li>';
                bookingsList.insertAdjacentHTML('afterend', 
                    '<button class="btn btn-primary mt-3" onclick="resetBookings()">Foglalások visszaállítása</button>'
                );
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
            bookingsList.insertAdjacentHTML('afterend', 
                '<button class="btn btn-primary mt-3" onclick="resetBookings()">Foglalások visszaállítása</button>'
            );
        } catch (error) {
            console.error('Error displaying bookings:', error);
            bookingsList.innerHTML = '<li class="list-group-item">Hiba történt a foglalások betöltésekor</li>';
        }
    };
    // Call displayBookings
    displayBookings();

    // Setup profile editing
    if (editProfileButton) {
        editProfileButton.addEventListener('click', () => {
            if (editProfileForm) {
                (document.getElementById('edit-name') as HTMLInputElement).value = currentUser.name;
                (document.getElementById('edit-email') as HTMLInputElement).value = currentUser.email;
                (document.getElementById('edit-phone') as HTMLInputElement).value = currentUser.phone;
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
            const updatedName = (document.getElementById('edit-name') as HTMLInputElement).value;
            const updatedEmail = (document.getElementById('edit-email') as HTMLInputElement).value;
            const updatedPhone = (document.getElementById('edit-phone') as HTMLInputElement).value;

            currentUser.name = updatedName;
            currentUser.email = updatedEmail;
            currentUser.phone = updatedPhone;

            setCurrentUser(currentUser);

            if (userNameSpan) userNameSpan.textContent = updatedName;
            if (userEmailSpan) userEmailSpan.textContent = updatedEmail;
            if (userPhoneSpan) userPhoneSpan.textContent = updatedPhone;

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

async function resetBookings() {
    activeBookingIds = [1, 2, 3];
    localStorage.setItem('activeBookings', JSON.stringify(activeBookingIds));
    setupUserPage();
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
            const loginForm = document.getElementById('login-form') as HTMLFormElement;
            const registerForm = document.getElementById('register-form') as HTMLFormElement;
    
            loginForm.addEventListener('submit', (event: SubmitEvent) => handleLogin(event));
            registerForm.addEventListener('submit', (event: SubmitEvent) => handleRegister(event));
        } else if (document.getElementById('user-name')) {
            setupUserPage();
        }
        const savedBookings = localStorage.getItem('activeBookings');
        if (savedBookings) {
            activeBookingIds = JSON.parse(savedBookings);
        }
    }
    
// Run initialization
init();
