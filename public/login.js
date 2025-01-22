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
// DOM Elements
const loginSection = document.getElementById('login-section');
const accountSection = document.getElementById('account-section');
const userNameSpan = document.getElementById('user-name');
const bookingsList = document.getElementById('bookings-list');
// 
// Forms
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const updateProfileForm = document.getElementById('update-profile-form');
const logoutButton = document.getElementById('logout-button');
// JSON Server URL
const API_URL = 'http://localhost:3000/users';
// Fetch all users from the server with error handling
function fetchUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(API_URL);
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
// Login function to check user credentials
function loginUser(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield fetchUsers();
        const user = users.find((u) => u.email === email && u.password === password);
        if (user) {
            setCurrentUser(user);
            showAccount(user);
        }
        else {
            alert('Hibás email vagy jelszó.');
        }
    });
}
// Register a new user
function registerUser(name, phone, email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield fetchUsers();
        if (users.some((u) => u.email === email)) {
            alert('Az email már használatban van.');
            return;
        }
        const newUser = { name, phone, email, password, bookings: [] };
        try {
            const response = yield fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });
            if (!response.ok)
                throw new Error('Failed to register user');
            alert('Regisztráció sikeres! Kérlek jelentkezz be.');
        }
        catch (error) {
            console.error('Error registering user:', error);
        }
    });
}
// Update the user's profile
function updateProfile(name, phone, email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentUser = getCurrentUser();
        if (!currentUser)
            return alert('Nincs bejelentkezett felhasználó.');
        try {
            const response = yield fetch(`${API_URL}/${currentUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.assign(Object.assign({}, currentUser), { name, phone, email, password })),
            });
            if (!response.ok)
                throw new Error('Failed to update user profile');
            const updatedUser = yield response.json();
            setCurrentUser(updatedUser);
            showAccount(updatedUser);
            alert('Profil sikeresen frissítve.');
        }
        catch (error) {
            console.error('Error updating profile:', error);
        }
    });
}
// Show login page
function showLogin() {
    loginSection.style.display = 'block';
    accountSection.style.display = 'none';
}
// Show account details
function showAccount(user) {
    loginSection.style.display = 'none';
    accountSection.style.display = 'block';
    userNameSpan.textContent = user.name;
    document.getElementById('update-name').value = user.name;
    document.getElementById('update-phone').value = user.phone;
    document.getElementById('update-email').value = user.email;
    document.getElementById('update-password').value = user.password;
    bookingsList.innerHTML = (user.bookings || []).map((booking) => `<li>${booking}</li>`).join('');
}
// Event Listeners
loginForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    yield loginUser(email, password);
}));
registerForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const phone = document.getElementById('register-phone').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    yield registerUser(name, phone, email, password);
}));
updateProfileForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const name = document.getElementById('update-name').value;
    const phone = document.getElementById('update-phone').value;
    const email = document.getElementById('update-email').value;
    const password = document.getElementById('update-password').value;
    yield updateProfile(name, phone, email, password);
}));
logoutButton.addEventListener('click', () => {
    clearCurrentUser();
    showLogin();
});
// Initial Load
const currentUser = getCurrentUser();
if (currentUser) {
    showAccount(currentUser);
}
else {
    showLogin();
}
