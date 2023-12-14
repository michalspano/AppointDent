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
    password: 'Password123!',
    longitude: 57.706178,
    latitude: 11.969585
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

// Simulate getting notifications from a dentist
function getNotifications (dentist: User): void {
  const headers = {
    'Content-Type': 'application/json',
    Cookies: dentist.cookies
  };

  const res: RefinedResponse<'text'> = http.get(host + `/notifications/${dentist.email}`, { headers, tags: { name: 'GetDentistNotifications' } });

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
  // Simulate getting notifications
  getNotifications(dentist);
}
