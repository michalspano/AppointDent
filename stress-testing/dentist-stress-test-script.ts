import http from 'k6/http';
import { check, sleep } from 'k6';


export let options = {
  stages: [
    { duration: '1m', target: 100 }, // Ramp up to 100 virtual users in 1 minute
    { duration: '1m', target: 200 }, // Ramp up to 200 virtual users in 1 minute
    { duration: '1m', target: 200 }, // Stay at 200 virtual users for 1 minutes
    { duration: '1m', target: 0 },   // Ramp down to 0 virtual users in 1 minute
  ],
};

// Array to store registered emails
let registeredEmails: any[] = [];

// Function to generate a unique email address for each virtual user
function generateUniqueEmail(userId: number) {
    const timestamp = Date.now();
    return `test${userId}_${timestamp}@example.com`;
}

// Function to simulate user registration
function registerDentist(userId: number) {
  let payload= {
    email: generateUniqueEmail(userId),
    firstName: 'Dentist',
    lastName: 'Doe',
    clinicCountry: 'Sweden',
    clinicCity: 'Göteborg',
    clinicStreet: 'Street',
    clinicHouseNumber: '1',
    clinicZipCode: '12345',
    picture: 'base64encodedimage',
    password: 'Password123!',
  };

  let headers = {
    'Content-Type': 'application/json',
  };

  // Make a POST request to your registration endpoint
  let res = http.post('http://localhost:3000/api/v1/dentists/register', JSON.stringify(payload)!, { headers: headers });

  // Check for expected status codes
  check(res!, {
    'Status is 201': (r) => r.status === 201,
    'Status is not 401': (r) => r.status !== 401,
  });

  // Add the registered email to the array
  registeredEmails.push(payload.email);

  // Simulate user think time
  sleep(Math.random() * 3); // Sleep for a random duration between 0 and 3 seconds
}

// Function to simulate user login
function loginDentist() {
  // Use a randomly selected registered email for login
  let emailIndex = Math.floor(Math.random() * registeredEmails.length);
  let loginEmail = registeredEmails[emailIndex];

  let payload = {
    email: loginEmail,
    password: 'Password123!',
  };

  let headers = {
    'Content-Type': 'application/json',
  };

  // Make a POST request to your login endpoint
  let res = http.post('http://localhost:3000/api/v1/dentists/login', JSON.stringify(payload), { headers: headers });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401,
  });

  // Simulate user think time
  sleep(Math.random() * 3); // Sleep for a random duration between 0 and 3 seconds
}

// Function to simulate getting all dentists
function getAllDentists() {
  let headers = {
    'Content-Type': 'application/json',
  };

  // Make a POST request to your login endpoint
  let res = http.get('http://localhost:3000/api/v1/dentists', { headers: headers });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401,
  });

  // Simulate user think time
  sleep(Math.random() * 3); // Sleep for a random duration between 0 and 3 seconds
}

// Function to simulate getting a dentist
function getDentist() {
  // Use a randomly selected registered email for login
  let emailIndex = Math.floor(Math.random() * registeredEmails.length);
  let loginEmail = registeredEmails[emailIndex];

  let headers = {
    'Content-Type': 'application/json',
  };

  // Make a POST request to your login endpoint
  let res = http.get(`http://localhost:3000/api/v1/dentists/${loginEmail}`, { headers: headers });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401,
  });

  // Simulate user think time
  sleep(Math.random() * 3); // Sleep for a random duration between 0 and 3 seconds
}


export default function () {
  // Get the virtual user ID (VU) from the context
  const userId: number = __VU;

  // Simulate dentist registration
  registerDentist(userId);

  // Simulate dentist login
  loginDentist();

  // Simulate getting all dentists
  getAllDentists();
}
