/**
 * Response data type from geocoding API
 */
export interface Place {
  boundingBox: [string, string, string, string]
  class: string
  displayName: string
  importance: number
  lat: string
  licence: string
  lon: string
  osmId: number
  osmType: string
  placeId: number
  poweredBy: string
  type: string
}

export interface Patient {
  email: string
  firstName: string
  lastName: string
  birthDate: number
}

export interface Dentist {
  email: string
  firstName: string
  lastName: string
  clinicCountry: string
  clinicCity: string
  clinicStreet: string
  clinicHouseNumber: number
  clinicZipCode: number
  picture: string
}

/**
 * @description the interface for the appointment object used in the fullcalendar
 * component on the client's side.
 */
export interface Appointment {
  id: string
  title: string // The patient name (to work with fullcalendar, it has to be named title)
  start: string // The start time (to work with fullcalendar, it has to be named start)
  end: string// The end time (to work with fullcalendar, it has to be named end)
}

/**
 * @description the interface for the appointment object retrieved from the database.
 * The id is a UUID (Universally Unique Identifier) and is
 * generated using the crypto module from node.js (here, the type is string; there's no
 * crypto in the browser).
 */
export interface AppointmentResponse {
  id: string
  start_timestamp: number
  end_timestamp: number
  dentistId: string
  patientId?: string
};

/**
 * An interface that represents a grouped appointment.
 * That is, a day that has one or more appointments.
 */
export interface GroupedAppointments {
  day: string
  appointments: Appointment[]
}

export interface Notification {
  message: string
  time: number
  email: string
  id?: string
}

export interface DentistRegistration {
  email: string
  password: string
  firstName: string
  lastName: string
  clinicCountry: string
  clinicCity: string
  clinicStreet: string
  clinicHouseNumber: string
  clinicZipCode: string
  picture: string
}

/**
 * @description the filter object is used to filter the appointments
 * based on a particular time interval, namely [start, end].
 */
export interface FilterInterval {
  start: string
  end: string
}

export interface PatientRegistration {
  email: string
  password: string
  firstName: string
  lastName: string
  birthDate: number
}

export enum UserType {
  Dentist = 'd',
  Patient = 'p'
}

/**
 * @description the response of the WHOIS topic is an object
 * with two properties: email and type. The email is the email
 * of the user, and the type is the type of the user.
 */
export interface WhoisResponse {
  status: SessionResponse
  email: string | undefined
  type: UserType | undefined
}

/**
 * @description the session service responds with 0 on failed requests
 * and with 1 on successful requests.
 */
export enum SessionResponse {
  Fail = 0,
  Success = 1
}

export interface Country {
  name: string
  code: string
}
