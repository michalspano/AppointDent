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

// Simulate patient registration
function registerUser (): User {
  const payload = {
    email: generateUniqueEmail(),
    firstName: 'Patient',
    lastName: 'Doe',
    password: 'Password123!',
    birthDate: 2000

  };

  const headers = {
    'Content-Type': 'application/json'
  };

  const res: RefinedResponse<'text'> = http.post(host + '/patients/register', JSON.stringify(payload), { headers, tags: { name: 'RegisterPatient' } });

  // Check for expected status codes
  check(res, {
    'Status is 201': (r) => r.status === 201,
    'Status is not 401': (r) => r.status !== 401
  });

  const patient: User = { email: payload.email, cookies: undefined };

  return patient;
}

// Simulate patient login
function loginUser (patient: User): User {
  const loginEmail: string = patient.email;
  const payload = {
    email: loginEmail,
    password: 'Password123!'
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  const res: RefinedResponse<'text'> = http.post(host + '/patients/login', JSON.stringify(payload), { headers, tags: { name: 'LoginPatient' } });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });

  patient.cookies = res.cookies;
  return patient;
}

// Simulate getting patient
function getPatient (patient: User): void {
  const loginEmail: string = patient.email;
  const cookies: string = patient.cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookies
  };

  const res: RefinedResponse<'text'> = http.get(host + `/patients/${loginEmail}`, { headers, tags: { name: 'GetPatient' } });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });
}

// Simulate patient patching
function patchPatient (patient: User): void {
  const payload = {
    lastName: 'Patient'
  };

  const loginEmail: string = patient.email;
  const cookies: string = patient.cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookies
  };

  const res: RefinedResponse<'text'> = http.patch(host + `/patients/${loginEmail}`, JSON.stringify(payload), { headers, tags: { name: 'UpdatePatient' } });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });
}

// Simulate patient logging out
function logoutPatient (patient: User): void {
  const cookies: string = patient.cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookies
  };

  const res: RefinedResponse<'text'> = http.del(host + '/patients/logout', null, { headers, tags: { name: 'LogoutPatient' } });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });
}

export default function (): void {
  let patient: User = registerUser();
  patient = loginUser(patient);
  getPatient(patient);
  patchPatient(patient);
  logoutPatient(patient);
}
