import http, { type RefinedResponse } from 'k6/http';
import { check } from 'k6';
import { type User, generateUniqueEmail, host } from './helper';

export const options = {
  stages: [
    { duration: '1m', target: 1000 },
    { duration: '1m', target: 3000 },
    { duration: '1m', target: 4000 },
    { duration: '30s', target: 0 }
  ]
};

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

  const res: RefinedResponse<'text'> = http.post(host + '/dentists/register', JSON.stringify(payload), { headers, tags: { name: 'RegisterDentist' } });

  // Check for expected status codes
  check(res, {
    'Status is 201': (r) => r.status === 201,
    'Status is not 401': (r) => r.status !== 401
  });

  const dentist: User = { email: payload.email, cookies: undefined };

  return dentist;
}

// Simulate dentist login
function loginDentist (dentist: User): User {
  const loginEmail: string = dentist.email;
  const payload = {
    email: loginEmail,
    password: 'Password123!'
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  const res: RefinedResponse<'text'> = http.post(host + '/dentists/login', JSON.stringify(payload), { headers, tags: { name: 'LoginDentist' } });

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
  const res: RefinedResponse<'text'> = http.get(host + '/dentists/', { headers });

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

  const res: RefinedResponse<'text'> = http.get(host + `/dentists/${dentist.email}`, { headers, tags: { name: 'GetDentist' } });

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

  const loginEmail: string = dentist.email;
  const cookies: string = dentist.cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookies
  };

  const res: RefinedResponse<'text'> = http.patch(host + `/dentists/${loginEmail}`, JSON.stringify(payload), { headers, tags: { name: 'UpdateDentist' } });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });
}

// Simulate dentist logging out
function logoutDentist (dentist: User): void {
  const cookies: string = dentist.cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookies
  };

  const res: RefinedResponse<'text'> = http.del(host + '/dentists/logout', null, { headers, tags: { name: 'LogoutDentist' } });

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
