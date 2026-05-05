// ========================================
// SERVICE LAYER — registerService.js
// ========================================
// Handles user registration data access:
//   1. Read auth_user.json
//   2. Find user by email (username)
//   3. Save new user record
// ========================================

const fs = require('fs');
const path = require('path');

const USERS_PATH = path.join(__dirname, '..', 'auth_user.json');

function readUsers() {
    const raw = fs.readFileSync(USERS_PATH, 'utf-8');
    const users = JSON.parse(raw);
    return Array.isArray(users) ? users : [];
}

function findUserByEmail(email) {
    const users = readUsers();
    const lowered = email.toLowerCase();
    const user = users.find((u) => String(u.username || '').toLowerCase() === lowered);
    return user || null;
}

function getNextId(users) {
    if (!Array.isArray(users) || users.length === 0) return 1;
    const maxId = users.reduce((max, u) => Math.max(max, Number(u.id) || 0), 0);
    return maxId + 1;
}

function saveUser(newUser) {
    const users = readUsers();
    const nextId = getNextId(users);

    const userToSave = {
        id: nextId,
        username: newUser.username,
        password: newUser.password,
        firstName: newUser.firstName,
        registeredAt: newUser.registeredAt,
    };

    users.push(userToSave);
    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));

    return userToSave;
}

module.exports = {
    findUserByEmail,
    saveUser,
};
