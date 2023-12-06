import http from 'k6/http';
import { check } from 'k6';

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
  const timestamp: number = Date.now();
  const randomString: string = Math.random().toString(36).substring(7); // Generate a random string
  return `test${timestamp}_${randomString}@example.com`;
}

// Function to simulate patient registration
function registerUser (): User {
  const payload = {
    email: generateUniqueEmail(),
    firstName: 'Patient',
    lastName: 'Doe',
    password: 'Password123!',
    birthDate: '2000'

  };

  const headers = {
    'Content-Type': 'application/json'
  };

  const res = http.post('http://localhost:3000/api/v1/patients/register', JSON.stringify(payload), { headers, tags: { name: 'RegisterPatient' } });

  // Check for expected status codes
  check(res, {
    'Status is 201': (r) => r.status === 201,
    'Status is not 401': (r) => r.status !== 401
  });

  const patient: User = { email: payload.email, cookies: undefined };

  return patient;
}

// Function to simulate patient login
function loginUser (patient: User): User {
  const loginEmail = patient.email;
  const payload = {
    email: loginEmail,
    password: 'Password123!'
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  const res = http.post('http://localhost:3000/api/v1/patients/login', JSON.stringify(payload), { headers, tags: { name: 'LoginPatient' } });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });

  patient.cookies = res.cookies;
  return patient;
}

function getPatient (patient: User): void {
  const loginEmail = patient.email;
  const cookies = patient.cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookies
  };

  const res = http.get(`http://localhost:3000/api/v1/patients/${loginEmail}`, { headers, tags: { name: 'GetPatient' } });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });
}

// Function to simulate patient patching
function patchPatient (patient: User): void {
  const payload = {
    lastName: 'Patient'
  };

  const loginEmail = patient.email;
  const cookies = patient.cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookies
  };

  const res = http.patch(`http://localhost:3000/api/v1/patients/${loginEmail}`, JSON.stringify(payload), { headers, tags: { name: 'UpdatePatient' } });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });
}

// Function to simulate patient logging out
function logoutPatient (patient: User): void {
  const cookies = patient.cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookies
  };

  const res = http.del('http://localhost:3000/api/v1/patients/logout', null, { headers, tags: { name: 'LogoutPatient' } });

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
