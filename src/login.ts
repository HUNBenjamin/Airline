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

// DOM Elements
const loginSection = document.getElementById('login-section') as HTMLElement;
const accountSection = document.getElementById('account-section') as HTMLElement;
const userNameSpan = document.getElementById('user-name') as HTMLElement;
const bookingsList = document.getElementById('bookings-list') as HTMLElement;
// 
// Forms
const loginForm = document.getElementById('login-form') as HTMLFormElement;
const registerForm = document.getElementById('register-form') as HTMLFormElement;
const updateProfileForm = document.getElementById('update-profile-form') as HTMLFormElement;
const logoutButton = document.getElementById('logout-button') as HTMLButtonElement;

// JSON Server URL
const API_URL = 'http://localhost:3000/users';

// Fetch all users from the server with error handling
async function fetchUsers(): Promise<any[]> {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch users');
        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

// Login function to check user credentials
async function loginUser(email: string, password: string) {
    const users = await fetchUsers();
    const user = users.find((u: { email: string; password: string }) => u.email === email && u.password === password);

    if (user) {
        setCurrentUser(user);
        showAccount(user);
    } else {
        alert('Hibás email vagy jelszó.');
    }
}

// Register a new user
async function registerUser(name: string, phone: string, email: string, password: string) {
    const users = await fetchUsers();
    if (users.some((u: { email: string }) => u.email === email)) {
        alert('Az email már használatban van.');
        return;
    }

    const newUser = { name, phone, email, password, bookings: [] };
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser),
        });

        if (!response.ok) throw new Error('Failed to register user');
        alert('Regisztráció sikeres! Kérlek jelentkezz be.');
    } catch (error) {
        console.error('Error registering user:', error);
    }
}

// Update the user's profile
async function updateProfile(name: string, phone: string, email: string, password: string) {
    const currentUser = getCurrentUser();
    if (!currentUser) return alert('Nincs bejelentkezett felhasználó.');

    try {
        const response = await fetch(`${API_URL}/${currentUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...currentUser, name, phone, email, password }),
        });

        if (!response.ok) throw new Error('Failed to update user profile');
        const updatedUser = await response.json();
        setCurrentUser(updatedUser);
        showAccount(updatedUser);
        alert('Profil sikeresen frissítve.');
    } catch (error) {
        console.error('Error updating profile:', error);
    }
}

// Show login page
function showLogin() {
    loginSection.style.display = 'block';
    accountSection.style.display = 'none';
}

// Show account details
function showAccount(user: { name: string; phone: string; email: string; password: string; bookings: string[] }) {
    loginSection.style.display = 'none';
    accountSection.style.display = 'block';
    userNameSpan.textContent = user.name;
    (document.getElementById('update-name') as HTMLInputElement).value = user.name;
    (document.getElementById('update-phone') as HTMLInputElement).value = user.phone;
    (document.getElementById('update-email') as HTMLInputElement).value = user.email;
    (document.getElementById('update-password') as HTMLInputElement).value = user.password;
    bookingsList.innerHTML = (user.bookings || []).map((booking) => `<li>${booking}</li>`).join('');
}

// Event Listeners
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (document.getElementById('login-email') as HTMLInputElement).value;
    const password = (document.getElementById('login-password') as HTMLInputElement).value;
    await loginUser(email, password);
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = (document.getElementById('register-name') as HTMLInputElement).value;
    const phone = (document.getElementById('register-phone') as HTMLInputElement).value;
    const email = (document.getElementById('register-email') as HTMLInputElement).value;
    const password = (document.getElementById('register-password') as HTMLInputElement).value;
    await registerUser(name, phone, email, password);
});

updateProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = (document.getElementById('update-name') as HTMLInputElement).value;
    const phone = (document.getElementById('update-phone') as HTMLInputElement).value;
    const email = (document.getElementById('update-email') as HTMLInputElement).value;
    const password = (document.getElementById('update-password') as HTMLInputElement).value;
    await updateProfile(name, phone, email, password);
});

logoutButton.addEventListener('click', () => {
    clearCurrentUser();
    showLogin();
});

// Initial Load
const currentUser = getCurrentUser();
if (currentUser) {
    showAccount(currentUser);
} else {
    showLogin();
}
