import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 }, // Ramp up to 100 virtual users in 1 minute
    { duration: '1m', target: 200 }, // Ramp up to 200 virtual users in 1 minute
    { duration: '1m', target: 200 }, // Stay at 200 virtual users for 1 minutes
    { duration: '1m', target: 0 } // Ramp down to 0 virtual users in 1 minute
  ]
};

interface User {
  email: string
  cookies: any
}

// Array to store registered users with their respective cookies
const registeredUsers: User[] = [];

// Function to generate a unique email address for each virtual user
function generateUniqueEmail (userId: any): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7); // Generate a random string
  return `test${userId}_${timestamp}_${randomString}@example.com`;
}

// Function to simulate user registration
function registerDentist (userId: number): void {
  const payload = {
    email: generateUniqueEmail(userId),
    firstName: 'Dentist',
    lastName: 'Doe',
    clinicCountry: 'Sweden',
    clinicCity: 'Göteborg',
    clinicStreet: 'Street',
    clinicHouseNumber: '1',
    clinicZipCode: '12345',
    picture: 'base64encodedimage',
    password: 'Password123!'
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  // Make a POST request to your registration endpoint
  const res = http.post('http://localhost:3000/api/v1/dentists/register', JSON.stringify(payload), { headers });

  // Check for expected status codes
  check(res, {
    'Status is 201': (r) => r.status === 201,
    'Status is not 401': (r) => r.status !== 401
  });

  // Add the registered email to the array
  registeredUsers.push({ email: payload.email, cookies: undefined });

  // Simulate user think time
  sleep(3);
}

// Function to simulate user login
function loginDentist (): void {
  const loginEmail = registeredUsers[registeredUsers.length - 1].email;
  const payload = {
    email: loginEmail,
    password: 'Password123!'
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  // Make a POST request to your login endpoint
  const res = http.post('http://localhost:3000/api/v1/dentists/login', JSON.stringify(payload), { headers });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });

  const cookies = res.cookies;
  registeredUsers.push({ email: loginEmail, cookies });

  // Simulate user think time
  sleep(3);
}

// Function to simulate getting all dentists
function getAllDentists (): void {
  const headers = {
    'Content-Type': 'application/json'
  };

  // Make a POST request to your login endpoint
  const res = http.get('http://localhost:3000/api/v1/dentists', { headers });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });

  // Simulate user think time
  sleep(3);
}

function getDentist (): void {
  const loginEmail = registeredUsers[registeredUsers.length - 1].email;
  const cookies = registeredUsers[registeredUsers.length - 1].cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookies
  };

  // Make a POST request to your login endpoint
  const res = http.get(`http://localhost:3000/api/v1/dentists/${loginEmail}`, { headers });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });

  // Simulate user think time
  sleep(3);
}

// Function to simulate dentist patching
function patchDentist (): void {
  const payload = {
    lastName: 'Dentist'
  };

  const loginEmail = registeredUsers[registeredUsers.length - 1].email;
  const cookies = registeredUsers[registeredUsers.length - 1].cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookies
  };

  // Make a PATCH request to modify the dentist information
  const res = http.patch(`http://localhost:3000/api/v1/dentists/${loginEmail}`, JSON.stringify(payload), { headers });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });

  // Simulate user think time
  sleep(3);
}

// Function to simulate dentist logging out
function logoutDentist (): void {
  const cookies = registeredUsers[registeredUsers.length - 1].cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookies
  };

  // Make a DELETE request to remove the dentist's cookie
  const res = http.del('http://localhost:3000/api/v1/dentists/logout', null, { headers });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });

  // Simulate user think time
  sleep(3);
}
export default function (): void {
  // Get the virtual user ID (VU) from the context
  const userId: number = __VU;

  // Simulate dentist registration
  registerDentist(userId);

  // Simulate dentist login
  loginDentist();

  // Simulate getting all dentists
  getAllDentists();

  // Simulate getting a dentist
  getDentist();

  // Simulae patching a dentist
  patchDentist();

  // Simulate logging out a dentist
  logoutDentist();
}
