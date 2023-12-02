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

// Array to store registered emails
const registeredEmails: any = [];

// Function to generate a unique email address for each virtual user
function generateUniqueEmail (userId: any): string {
  const timestamp = Date.now();
  return `test${userId}_${timestamp}@example.com`;
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
  registeredEmails.push(payload.email);

  // Simulate user think time
  sleep(Math.random() * 3); // Sleep for a random duration between 0 and 3 seconds
}

// Function to simulate user login
function loginUser (): void {
  // Use a randomly selected registered email for login
  const emailIndex = Math.floor(Math.random() * registeredEmails.length);
  const loginEmail = registeredEmails[emailIndex];

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

  // Simulate user think time
  sleep(Math.random() * 3); // Sleep for a random duration between 0 and 3 seconds
}

export default function (): void {
  // Get the virtual user ID (VU) from the context
  const userId = __VU;

  // Simulate user registration
  registerUser(userId);

  // Simulate user login
  loginUser();
}
