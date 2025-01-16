// Utility functions for localStorage management (optional if you still want to manage local session)
export function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser')!);
}

export function setCurrentUser(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

export function clearCurrentUser() {
    localStorage.removeItem('currentUser');
}

// DOM Elements (Adjust the IDs as per your HTML)
export const loginSection = document.getElementById('login-section') as HTMLElement;
export const accountSection = document.getElementById('account-section') as HTMLElement;
export const userNameSpan = document.getElementById('user-name') as HTMLElement;
export const bookingsList = document.getElementById('bookings-list') as HTMLElement;

// Forms
export const loginForm = document.getElementById('login-form') as HTMLFormElement;
export const registerForm = document.getElementById('register-form') as HTMLFormElement;
export const updateProfileForm = document.getElementById('update-profile-form') as HTMLFormElement;
export const logoutButton = document.getElementById('logout-button') as HTMLButtonElement;

// JSON Server URL
const API_URL = 'http://localhost:3000/users';

// Fetch all users from the server
async function fetchUsers(): Promise<any[]> {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data;
}

// Login function to check user credentials
export async function loginUser(email: string, password: string) {
    const users = await fetchUsers();
    const user = users.find((u: { email: string; password: string; }) => u.email === email && u.password === password);

    if (user) {
        setCurrentUser(user);
        showAccount(user);
    } else {
        alert('Hibás email vagy jelszó.');
    }
}

// Register a new user
export async function registerUser(name: string, phone: string, email: string, password: string) {
    const users = await fetchUsers();
    if (users.some((u: { email: string; }) => u.email === email)) {
        alert('Az email már használatban van.');
        return;
    }

    const newUser = { name, phone, email, password, bookings: [] };
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
    });
    const user = await response.json();
    alert('Regisztráció sikeres! Kérlek jelentkezz be.');
}

// Update the user's profile
export async function updateProfile(name: string, phone: string, email: string, password: string) {
    const users = await fetchUsers();
    const currentUser = getCurrentUser();
    const userIndex = users.findIndex((u: { email: string; }) => u.email === currentUser.email);

    if (userIndex !== -1) {
        const updatedUser = { ...users[userIndex], name, phone, email, password };
        const response = await fetch(`${API_URL}/${users[userIndex].id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUser),
        });

        const user = await response.json();
        setCurrentUser(user);
        showAccount(user);
        alert('Profil sikeresen frissítve.');
    } else {
        alert('Hiba történt a profil frissítése során.');
    }
}

// Show login page
export function showLogin() {
    loginSection.style.display = 'block';
    accountSection.style.display = 'none';
}

// Show account details
export function showAccount(user: { name: string; phone: string; email: string; password: string; bookings: string[]; }) {
    loginSection.style.display = 'none';
    accountSection.style.display = 'block';
    userNameSpan.textContent = user.name;
    (document.getElementById('update-name') as HTMLInputElement).value = user.name;
    (document.getElementById('update-phone') as HTMLInputElement).value = user.phone;
    (document.getElementById('update-email') as HTMLInputElement).value = user.email;
    (document.getElementById('update-password') as HTMLInputElement).value = user.password;
    bookingsList.innerHTML = user.bookings.map(booking => `<li>${booking}</li>`).join('');
}

// Event Listeners
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = (document.getElementById('login-email') as HTMLInputElement).value;
    const password = (document.getElementById('login-password') as HTMLInputElement).value;
    loginUser(email, password);
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (document.getElementById('register-name') as HTMLInputElement).value;
    const phone = (document.getElementById('register-phone') as HTMLInputElement).value;
    const email = (document.getElementById('register-email') as HTMLInputElement).value;
    const password = (document.getElementById('register-password') as HTMLInputElement).value;
    registerUser(name, phone, email, password);
});

updateProfileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (document.getElementById('update-name') as HTMLInputElement).value;
    const phone = (document.getElementById('update-phone') as HTMLInputElement).value;
    const email = (document.getElementById('update-email') as HTMLInputElement).value;
    const password = (document.getElementById('update-password') as HTMLInputElement).value;
    updateProfile(name, phone, email, password);
});

logoutButton.addEventListener('click', () => {
    clearCurrentUser();
    showLogin();
});

// Initial load
const currentUser = getCurrentUser();
if (currentUser) {
    showAccount(currentUser);
} else {
    showLogin();
}
