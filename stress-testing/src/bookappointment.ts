import http from 'k6/http';
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

  const res = http.post(host + '/dentists/register', JSON.stringify(payload), { headers, tags: { name: 'RegisterDentist' } });

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
  const loginEmail: string = dentist.email;
  const payload = {
    email: loginEmail,
    password: 'Password123!'
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  const res = http.post(host + '/dentists/login', JSON.stringify(payload), { headers, tags: { name: 'LoginDentist' } });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });

  dentist.cookies = res.cookies;
  return dentist;
}

// Simulate appointment creation
function createAppointment (dentist: User): string {
  const dentistEmail: string = dentist.email;
  const cookies: string = dentist.cookies;
  const payload = {
    start_timestamp: 123131312,
    end_timestamp: 123131987,
    dentistId: dentistEmail

  };

  const headers = {
    'Content-Type': 'application/json',
    Cookies: cookies
  };

  const res = http.post(host + '/appointments', JSON.stringify(payload), { headers, tags: { name: 'CreateAppointment' } });
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

// Simulate patient registration
function registerPatient (): User {
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

  const res = http.post(host + '/patients/register', JSON.stringify(payload), { headers, tags: { name: 'RegisterPatient' } });

  // Check for expected status codes
  check(res, {
    'Status is 201': (r) => r.status === 201,
    'Status is not 401': (r) => r.status !== 401
  });

  const patient: User = { email: payload.email, cookies: undefined };

  return patient;
}

// Simulate patient login
function loginPatient (patient: User): User {
  const loginEmail: string = patient.email;
  const payload = {
    email: loginEmail,
    password: 'Password123!'
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  const res = http.post(host + '/patients/login', JSON.stringify(payload), { headers, tags: { name: 'LoginPatient' } });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });

  patient.cookies = res.cookies;
  return patient;
}

// Simulate getting all unbooked appointments
function getAllAppointments (patient: User): void {
  const patientEmail: string = patient.email;
  const cookies: string = patient.cookies;

  const headers = {
    'Content-Type': 'application/json',
    Cookies: cookies
  };

  const res = http.get(host + `/appointments/?userId=${patientEmail}`, { headers, tags: { name: 'GetAllAppointments' } });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });
}

// Simulate patient booking an appointment
function bookAppointment (patient: User, appointmentId: string): void {
  const patientEmail: string = patient.email;

  const headers = {
    'Content-Type': 'application/json',
    Cookies: patient.cookies
  };

  const res = http.patch(host + `/appointments/${appointmentId}?patientId=${patientEmail}&toBook=true`, null, { headers, tags: { name: 'BookAppointment' } });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });
}

// Simulate patient getting all of their appointments
function getAppointments (patient: User): void {
  const patientEmail: string = patient.email;

  const headers = {
    'Content-Type': 'application/json',
    Cookies: patient.cookies
  };

  const res = http.get(host + `/appointments/patients/${patientEmail}`, { headers, tags: { name: 'GetPatientAppointments' } });

  // Check for expected status codes
  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Status is not 401': (r) => r.status !== 401
  });
}

// Simulate patient unbooking an appointment
function unbookAppointment (patient: User, appointmentId: string): void {
  const patientEmail: string = patient.email;

  const headers = {
    'Content-Type': 'application/json',
    Cookies: patient.cookies
  };

  const res = http.patch(host + `/appointments/${appointmentId}?patientId=${patientEmail}&toBook=false`, null, { headers, tags: { name: 'UnbookAppointment' } });

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
  // Simulate dentist creating an appointment
  const appointmentId: string = createAppointment(dentist);

  // Simulate patient registration
  let patient: User = registerPatient();
  // Simulate patient login
  patient = loginPatient(patient);
  // Simulate patient getting all appointments
  getAllAppointments(patient);

  // Simulate patient booking an appointment
  bookAppointment(patient, appointmentId);
  // Simulate patient getting all of their appointments
  getAppointments(patient);
  // Simulate patient unbooking their appointment
  unbookAppointment(patient, appointmentId);
}
