import http from 'k6/http';
import { check } from 'k6';

const host = 'http://localhost:3000/api/v1/dentists';
export const options = {
  stages: [
    { duration: '10s', target: 1500 },
    { duration: '2m', target: 3000 }
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

// Simulate getting all dentists
function getAllDentists (): void {
  const headers = {
    'Content-Type': 'application/json'
  };

  // Make a POST request to your login endpoint
  const res = http.get(host + '/', { headers });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });
}

function getDentist (dentist: User): void {
  const headers = {
    'Content-Type': 'application/json'
  };

  const res = http.get(host + `/${dentist.email}`, { headers, tags: { name: 'GetDentist' } });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });
}

// Simulate dentist patching
function patchDentist (dentist: User): void {
  const payload = {
    lastName: 'Dentist'
  };

  const loginEmail = dentist.email;
  const cookies = dentist.cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookies
  };

  const res = http.patch(host + `/${loginEmail}`, JSON.stringify(payload), { headers, tags: { name: 'UpdateDentist' } });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });
}

// Simulate dentist logging out
function logoutDentist (dentist: User): void {
  const cookies = dentist.cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookies
  };

  const res = http.del(host + '/logout', null, { headers, tags: { name: 'LogoutDentist' } });

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

  // Simulate getting all dentists
  getAllDentists();

  // Simulate getting a dentist
  getDentist(dentist);

  // Simulae patching a dentist
  patchDentist(dentist);

  // Simulate logging out a dentist
  logoutDentist(dentist);
}
