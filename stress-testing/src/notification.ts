import http from 'k6/http';
import { check } from 'k6';

const host = 'http://localhost:3000/api/v1/dentists';
export const options = {
  stages: [
    { duration: '30s', target: 3000 },
    { duration: '1m', target: 5000 }
  ]
};

interface User {
  email: string
  cookies: any
}

// Function to generate a unique email address for each virtual user
function generateUniqueEmail (): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7); // Generate a random string
  return `test${timestamp}_${randomString}@example.com`;
}

// Simulate dentist registration
function registerDentist (): User {
  const payload = {
    email: generateUniqueEmail(),
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

  const res = http.post(host + '/register', JSON.stringify(payload), { headers, tags: { name: 'RegisterDentist' } });

  // Check for expected status codes
  check(res, {
    'Status is 201': (r) => r.status === 201,
    'Status is not 401': (r) => r.status !== 401
  });

  // Add the registered email to the array
  const dentist: User = { email: payload.email, cookies: undefined };

  return dentist;
}

// Simulate dentist login
function loginDentist (dentist: User): User {
  const loginEmail = dentist.email;
  const payload = {
    email: loginEmail,
    password: 'Password123!'
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  const res = http.post(host + '/login', JSON.stringify(payload), { headers, tags: { name: 'LoginDentist' } });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });

  dentist.cookies = res.cookies;
  return dentist;
}

function getNotifications (dentist: User): void {
  const headers = {
    'Content-Type': 'application/json',
    Cookies: dentist.cookies
  };

  const res = http.get(`http://localhost:3000/api/v1/notifications/${dentist.email}`, { headers, tags: { name: 'GetDentistNotifications' } });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });
}

export default function (): void {
  // Simulate dentist registration
  let dentist: User = registerDentist();

  // Simulate dentist login
  dentist = loginDentist(dentist);
  getNotifications(dentist);
}
