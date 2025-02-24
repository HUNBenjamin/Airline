(window as any).cancelBooking = cancelBooking;
(window as any).cancelHotelBooking = cancelHotelBooking;
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

async function fetchHotelById(hotelId: number): Promise<any> {
    try {
        const response = await fetch(`http://localhost:3000/hotels/${hotelId}`);
        if (!response.ok) throw new Error('Failed to fetch hotel data');
        return await response.json();
    } catch (error) {
        console.error('Error fetching hotel:', error);
        return null;
    }
}

async function cancelHotelBooking(hotelId: number) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    const hotel = await fetchHotelById(hotelId);
    if (!hotel) {
        alert('Hiba történt a hotel adatainak lekérésekor.');
        return;
    }
    currentUser.hotelBookings = currentUser.hotelBookings.filter((id: number) => id !== hotelId);
    setCurrentUser(currentUser);
    try {
        const response = await fetch(`http://localhost:3000/users/${currentUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentUser),
        });

        if (!response.ok) throw new Error('Failed to update user on server');
    } catch (error) {
        console.error('Error updating user:', error);
    }
    const hotelElement = document.getElementById(`hotel-booking-${hotelId}`);
    if (hotelElement) {
        hotelElement.remove();
    }
    alert(`A(z) ${hotel.name} hotel foglalása sikeresen törölve!`);
}

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

function redirectToPage(page: string) {
    window.location.href = page;
}

async function handleLogin(event: SubmitEvent) {
    event.preventDefault();
    const email = (document.getElementById('login-email') as HTMLInputElement).value;
    const password = (document.getElementById('login-password') as HTMLInputElement).value;

    const users = await fetchUsers();
    const user = users.find((u: { email: string; password: string }) => u.email === email && u.password === password);

    if (user) {
        try {
            const response = await fetch(`http://localhost:3000/users/${user.id}`);
            if (!response.ok) throw new Error('Failed to fetch user data');
            const updatedUser = await response.json();
            setCurrentUser(updatedUser);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }

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

    const newUser = { name, phone, email, password, bookings: [], hotelBookings: [], guests: 1 };
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

    if (userNameSpan) userNameSpan.textContent = currentUser.name;
    if (userEmailSpan) userEmailSpan.textContent = currentUser.email;
    if (userPhoneSpan) userPhoneSpan.textContent = currentUser.phone;

    const displayBookings = async () => {
        if (!bookingsList) return;

        try {
            const flights = await fetchFlights();
            const hotels = await fetchHotels(); 

            const activeFlights = flights.filter(flight => 
                activeBookingIds.includes(Number(flight.id))
            ).map(flight => {
                const totalPrice = flight.Price * (currentUser.guests || 1);
                return { ...flight, totalPrice };
            });

            const activeHotels = hotels.filter((hotel: { id: string }) => 
                currentUser.hotelBookings.includes(Number(hotel.id))
            ).map((hotel: any) => {
                const bookingDates = currentUser.hotelBookingDates?.[hotel.id];
                if (!bookingDates) {
                    console.error('Nincsenek dátumok ehhez a foglaláshoz:', hotel.id);
                    return null;
                }
        
                const totalPrice = calculateTotalPrice(
                    hotel.pricePerNight,
                    bookingDates.dateFrom,
                    bookingDates.dateTo,
                    bookingDates.guests || 1
                );
                return { ...hotel, totalPrice, bookingDates };
            }).filter((hotel): hotel is NonNullable<typeof hotel> => hotel !== null);

            if (activeFlights.length === 0 && activeHotels.length === 0) {
                bookingsList.innerHTML = '<li class="list-group-item">Nincsenek aktív foglalások</li>';
                bookingsList.insertAdjacentHTML('afterend', 
                    '<button class="btn btn-primary mt-3" onclick="resetBookings()">Foglalások visszaállítása</button>'
                );
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

                ...activeHotels.map((hotel: { id: string; name: string; city: string; bookingDates: { dateFrom: string; dateTo: string }; pricePerNight: number; totalPrice: number }) => `
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
            bookingsList.insertAdjacentHTML('afterend', 
                '<button class="btn btn-primary mt-3" onclick="resetBookings()">Foglalások visszaállítása</button>'
            );
        } catch (error) {
            console.error('Error displaying bookings:', error);
            bookingsList.innerHTML = '<li class="list-group-item">Hiba történt a foglalások betöltésekor</li>';
        }
    };    
    async function fetchHotels(): Promise<any[]> {
        try {
            const response = await fetch("http://localhost:3000/hotels");
            if (!response.ok) throw new Error('Failed to fetch hotels');
            return await response.json();
        } catch (error) {
            console.error('Error fetching hotels:', error);
            return [];
        }
    }

    displayBookings();

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

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            clearCurrentUser();
            updateNavbarUsername();
            redirectToPage('./login.html');
        });
    }
}

export async function addBooking(flightId: number) {
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
        const response = await fetch(`http://localhost:3000/users/${currentUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentUser),
        });

        if (!response.ok) throw new Error('Failed to update user on server');

        activeBookingIds.push(flightId);
        localStorage.setItem('activeBookings', JSON.stringify(activeBookingIds));

        alert('Foglalás sikeres!');
        redirectToPage('./user.html');
    } catch (error) {
        console.error('Error updating user:', error);
        alert('Hiba történt a foglalás során.');
    }
}

async function resetBookings() {
    activeBookingIds = [1, 2, 3];
    const currentUser = getCurrentUser();
    if (currentUser) {
        currentUser.hotelBookings = [];
        setCurrentUser(currentUser);
    }
    localStorage.setItem('activeBookings', JSON.stringify(activeBookingIds));
    setupUserPage();
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
        activeBookingIds = [1, 2, 3]; 
        localStorage.setItem('activeBookings', JSON.stringify(activeBookingIds));
    }
}

function init() {
    fetchallFlightsData();
    initializeActiveBookings();
    updateNavbarUsername(); 
    if (document.getElementById('login-form')) {
        const loginForm = document.getElementById('login-form') as HTMLFormElement;
        const registerForm = document.getElementById('register-form') as HTMLFormElement;

        loginForm.addEventListener('submit', (event: SubmitEvent) => handleLogin(event));
        registerForm.addEventListener('submit', (event: SubmitEvent) => handleRegister(event));
    } else if (document.getElementById('user-name')) {
        setupUserPage();
    }
}

init();

function calculateTotalPrice(pricePerNight: number, dateFrom: string, dateTo: string, guests: number): number {
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    const timeDiff = toDate.getTime() - fromDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return pricePerNight * nights * guests;
}