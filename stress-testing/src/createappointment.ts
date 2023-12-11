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

// Function to simulate user registration
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

  // Make a POST request to your registration endpoint
  const res: RefinedResponse<'text'> = http.post(host + '/dentists/register', JSON.stringify(payload), { headers, tags: { name: 'RegisterDentist' } });

  // Check for expected status codes
  check(res, {
    'Status is 201': (r) => r.status === 201,
    'Status is not 401': (r) => r.status !== 401
  });

  // Add the registered email to the array
  const user: User = { email: payload.email, cookies: undefined };

  return user;
}

// Function to simulate user login
function loginDentist (user: User): User {
  const loginEmail: string = user.email;
  const payload = {
    email: loginEmail,
    password: 'Password123!'
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  // Make a POST request to your login endpoint
  const res: RefinedResponse<'text'> = http.post(host + '/dentists/login', JSON.stringify(payload), { headers, tags: { name: 'LoginDentist' } });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });

  user.cookies = res.cookies;
  return user;
}

// Simulate appointment creation
function createAppointment (user: User): string {
  const dentistEmail: string = user.email;
  const cookies: string = user.cookies;
  const payload = {
    start_timestamp: 123131312,
    end_timestamp: 123131987,
    dentistId: dentistEmail

  };

  const headers = {
    'Content-Type': 'application/json',
    Cookies: cookies
  };

  const res: RefinedResponse<'text'> = http.post(host + '/appointments', JSON.stringify(payload), { headers, tags: { name: 'CreateAppointment' } });
  // Check for expected status codes
  check(res, {
    'Status is 201': (r) => r.status === 201,
    'Status is not 401': (r) => r.status !== 401
  });

  const responseBody: any = res.body;

  // Parse the JSON response
  const response = responseBody !== null ? JSON.parse(responseBody) : null;

  // Access the appointment ID
  const appointmentId: string = response?.id;
  return appointmentId;
}

// Simulate getting all appointments from a dentist
function getAppointments (user: User): void {
  const dentistEmail: string = user.email;
  const cookies: string = user.cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookies: cookies
  };

  const res: RefinedResponse<'text'> = http.get(host + `/appointments/dentists/${dentistEmail}?userId=${dentistEmail}`, { headers, tags: { name: 'GetDentistAppointments' } });
  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });
}

// Simulate appointment deletion
function deleteAppointment (user: User, appointmentId: string): void {
  const dentistEmail: string = user.email;
  const cookies: string = user.cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookies: cookies
  };

  const res: RefinedResponse<'text'> = http.del(host + `/appointments/${appointmentId}?dentistId=${dentistEmail}`, null, { headers, tags: { name: 'DeleteAppointment' } });
  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });
}

export default function (): void {
  // Simulate dentist registration
  let user: User = registerDentist();

  // Simulate dentist login
  user = loginDentist(user);

  const appointmentId: string = createAppointment(user);
  getAppointments(user);
  deleteAppointment(user, appointmentId);
}
