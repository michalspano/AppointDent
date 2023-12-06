import http from 'k6/http';
import { check } from 'k6';

const host = 'http://localhost:3000/api/v1/dentists';
export const options = {
  stages: [
    { duration: '30s', target: 2000 },
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
  const res = http.post(host + '/register', JSON.stringify(payload), { headers, tags: { name: 'RegisterDentist' } });

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
  const res = http.post(host + '/login', JSON.stringify(payload), { headers, tags: { name: 'LoginDentist' } });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });

  user.cookies = res.cookies;
  return user;
}

// Function to simulate appointment creation
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

  // Make a POST request to your login endpoint
  const res = http.post('http://localhost:3000/api/v1/appointments', JSON.stringify(payload), { headers, tags: { name: 'CreateAppointment' } });
  // Check for expected status codes
  check(res, {
    'Status is 201': (r) => r.status === 201,
    'Status is not 401': (r) => r.status !== 401
  });

  // Parse the response body as JSON if it's a string
  const responseBody: any = res.body;

  // Parse the JSON response
  const response = responseBody !== null ? JSON.parse(responseBody) : null;

  // Access the appointment ID
  const appointmentId: string = response?.id;
  return appointmentId;
}

// Function to simulate getting all appointments from a dentist
function getAppointments (user: User): void {
  const dentistEmail: string = user.email;
  const cookies: string = user.cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookies: cookies
  };

  // Make a POST request to your login endpoint
  const res = http.get(`http://localhost:3000/api/v1/appointments/dentists/${dentistEmail}?userId=${dentistEmail}`, { headers, tags: { name: 'GetDentistAppointments' } });
  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });
}

// Function to simulate appointment creation
function deleteAppointment (user: User, appointmentId: string): void {
  const dentistEmail: string = user.email;
  const cookies: string = user.cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookies: cookies
  };

  // Make a POST request to your login endpoint
  const res = http.del(`http://localhost:3000/api/v1/appointments/${appointmentId}?dentistId=${dentistEmail}`, null, { headers, tags: { name: 'DeleteAppointment' } });
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
