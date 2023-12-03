"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = void 0;
var http_1 = require("k6/http");
var k6_1 = require("k6");
exports.options = {
    stages: [
        { duration: '1m', target: 100 }, // Ramp up to 100 virtual users in 1 minute
        { duration: '1m', target: 200 }, // Ramp up to 200 virtual users in 1 minute
        { duration: '1m', target: 200 }, // Stay at 200 virtual users for 1 minutes
        { duration: '1m', target: 0 }, // Ramp down to 0 virtual users in 1 minute
    ],
};
// Array to store registered emails
var registeredEmails = [];
// Function to generate a unique email address for each virtual user
function generateUniqueEmail(userId) {
    var timestamp = Date.now();
    return "test".concat(userId, "_").concat(timestamp, "@example.com");
}
// Function to simulate user registration
function registerUser(userId) {
    var payload = {
        email: generateUniqueEmail(userId),
        firstName: 'Patient',
        lastName: 'Doe',
        password: 'Password123!',
        birthDate: '2000'
    };
    var headers = {
        'Content-Type': 'application/json',
    };
    // Make a POST request to your registration endpoint
    var res = http_1.default.post('http://localhost:3000/api/v1/patients/register', JSON.stringify(payload), { headers: headers });
    // Check for expected status codes
    (0, k6_1.check)(res, {
        'Status is 201': function (r) { return r.status === 201; },
        'Status is not 401': function (r) { return r.status !== 401; },
    });
    // Add the registered email to the array
    registeredEmails.push(payload.email);
    // Simulate user think time
    (0, k6_1.sleep)(Math.random() * 3); // Sleep for a random duration between 0 and 3 seconds
}
// Function to simulate user login
function loginUser() {
    // Use a randomly selected registered email for login
    var emailIndex = Math.floor(Math.random() * registeredEmails.length);
    var loginEmail = registeredEmails[emailIndex];
    var payload = {
        email: loginEmail,
        password: 'Password123!',
    };
    var headers = {
        'Content-Type': 'application/json',
    };
    // Make a POST request to your login endpoint
    var res = http_1.default.post('http://localhost:3000/api/v1/patients/login', JSON.stringify(payload), { headers: headers });
    // Check for expected status codes
    (0, k6_1.check)(res, {
        'Status is 200': function (r) { return r.status === 200; },
        'Status is not 401': function (r) { return r.status !== 401; },
    });
    // Simulate user think time
    (0, k6_1.sleep)(Math.random() * 3); // Sleep for a random duration between 0 and 3 seconds
}
function default_1() {
    // Get the virtual user ID (VU) from the context
    var userId = __VU;
    // Simulate user registration
    registerUser(userId);
    // Simulate user login
    loginUser();
}
exports.default = default_1;
