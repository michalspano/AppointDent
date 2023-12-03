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
function registerUser (userId: number): void {
  const payload = {
    email: generateUniqueEmail(userId),
    firstName: 'Patient',
    lastName: 'Doe',
    password: 'Password123!',
    birthDate: '2000'

  };

  const headers = {
    'Content-Type': 'application/json'
  };

  // Make a POST request to your registration endpoint
  const res = http.post('http://localhost:3000/api/v1/patients/register', JSON.stringify(payload), { headers });

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
function loginUser (): void {
  const loginEmail = registeredUsers[registeredUsers.length - 1].email;
  const payload = {
    email: loginEmail,
    password: 'Password123!'
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  // Make a POST request to your login endpoint
  const res = http.post('http://localhost:3000/api/v1/patients/login', JSON.stringify(payload), { headers });

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

function getPatient (): void {
  const loginEmail = registeredUsers[registeredUsers.length - 1].email;
  const cookies = registeredUsers[registeredUsers.length - 1].cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookies
  };

  // Make a POST request to your login endpoint
  const res = http.get(`http://localhost:3000/api/v1/patients/${loginEmail}`, { headers });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });

  // Simulate user think time
  sleep(3);
}

// Function to simulate dentist patching
function patchPatient (): void {
  const payload = {
    lastName: 'Patient'
  };

  const loginEmail = registeredUsers[registeredUsers.length - 1].email;
  const cookies = registeredUsers[registeredUsers.length - 1].cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookies
  };

  // Make a PATCH request to modify the dentist information
  const res = http.patch(`http://localhost:3000/api/v1/patients/${loginEmail}`, JSON.stringify(payload), { headers });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });

  // Simulate user think time
  sleep(3);
}

// Function to simulate dentist logging out
function logoutPatient (): void {
  const cookies = registeredUsers[registeredUsers.length - 1].cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookies
  };

  // Make a DELETE request to remove the dentist's cookie
  const res = http.del('http://localhost:3000/api/v1/patients/logout', null, { headers });

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

  // Simulate user registration
  registerUser(userId);

  // Simulate user login
  loginUser();

  getPatient();
  patchPatient();
  logoutPatient();
}
