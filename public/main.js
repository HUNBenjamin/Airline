"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutButton = exports.updateProfileForm = exports.registerForm = exports.loginForm = exports.bookingsList = exports.userNameSpan = exports.accountSection = exports.loginSection = void 0;
exports.getCurrentUser = getCurrentUser;
exports.setCurrentUser = setCurrentUser;
exports.clearCurrentUser = clearCurrentUser;
exports.loginUser = loginUser;
exports.registerUser = registerUser;
exports.updateProfile = updateProfile;
exports.showLogin = showLogin;
exports.showAccount = showAccount;
// Utility functions for localStorage management (optional if you still want to manage local session)
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}
function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}
function clearCurrentUser() {
    localStorage.removeItem('currentUser');
}
// DOM Elements (Adjust the IDs as per your HTML)
exports.loginSection = document.getElementById('login-section');
exports.accountSection = document.getElementById('account-section');
exports.userNameSpan = document.getElementById('user-name');
exports.bookingsList = document.getElementById('bookings-list');
// Forms
exports.loginForm = document.getElementById('login-form');
exports.registerForm = document.getElementById('register-form');
exports.updateProfileForm = document.getElementById('update-profile-form');
exports.logoutButton = document.getElementById('logout-button');
// JSON Server URL
const API_URL = 'http://localhost:3000/users';
// Fetch all users from the server
function fetchUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(API_URL);
        const data = yield response.json();
        return data;
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
        const response = yield fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser),
        });
        const user = yield response.json();
        alert('Regisztráció sikeres! Kérlek jelentkezz be.');
    });
}
// Update the user's profile
function updateProfile(name, phone, email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield fetchUsers();
        const currentUser = getCurrentUser();
        const userIndex = users.findIndex((u) => u.email === currentUser.email);
        if (userIndex !== -1) {
            const updatedUser = Object.assign(Object.assign({}, users[userIndex]), { name, phone, email, password });
            const response = yield fetch(`${API_URL}/${users[userIndex].id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUser),
            });
            const user = yield response.json();
            setCurrentUser(user);
            showAccount(user);
            alert('Profil sikeresen frissítve.');
        }
        else {
            alert('Hiba történt a profil frissítése során.');
        }
    });
}
// Show login page
function showLogin() {
    exports.loginSection.style.display = 'block';
    exports.accountSection.style.display = 'none';
}
// Show account details
function showAccount(user) {
    exports.loginSection.style.display = 'none';
    exports.accountSection.style.display = 'block';
    exports.userNameSpan.textContent = user.name;
    document.getElementById('update-name').value = user.name;
    document.getElementById('update-phone').value = user.phone;
    document.getElementById('update-email').value = user.email;
    document.getElementById('update-password').value = user.password;
    exports.bookingsList.innerHTML = user.bookings.map(booking => `<li>${booking}</li>`).join('');
}
// Event Listeners
exports.loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    loginUser(email, password);
});
exports.registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const phone = document.getElementById('register-phone').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    registerUser(name, phone, email, password);
});
exports.updateProfileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('update-name').value;
    const phone = document.getElementById('update-phone').value;
    const email = document.getElementById('update-email').value;
    const password = document.getElementById('update-password').value;
    updateProfile(name, phone, email, password);
});
exports.logoutButton.addEventListener('click', () => {
    clearCurrentUser();
    showLogin();
});
// Initial load
const currentUser = getCurrentUser();
if (currentUser) {
    showAccount(currentUser);
}
else {
    showLogin();
}
