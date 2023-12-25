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
  longitude: number
  latitude: number
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
  clinicHouseNumber: number
  clinicZipCode: number
  picture: string
  longitude: number | undefined
  latitude: number | undefined
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

/**
 * @description a custom type that denotes the relational table
 * when a subscription is made between a patient and a dentist.
 */
export interface Subscription {
  dentistEmail: string
  patientEmail: string
};

/**
 * @description the response status of seeing if a patient is subscribed
 * to a dentist.
 */
export enum SubscriptionStatus {
  SUBSCRIBED, UNSUBSCRIBED
}

/**
 * Category of the request (patients, dentist etc.)
 * HTTP method
 * And if we should only regard logged in users.
 */
export interface ChartType {
  category: string
  method: string
  loggedInOnly: boolean
}

/**
 * Labels is the x axis and data is the y axis, admin component
 */
export interface ChartData {
  data: number[]
  labels: string[]
}

/**
 * Response from the statistics API
 */
export interface AnalyticsResponse {
  count: number
  interval: number
}

/**
 * The number of available appointments in the system
 */
export interface AvailableAppointmentsCount {
  count: number
}

export interface ServicesUnavailableModalProps {
  onCancel: () => void
  services: string[]
}

export interface Country {
  name: string
  code: string
}

export interface Tab {
  tab: string
  title: string
}

export interface NotificationsResponse {
  length: number
  email: string
  data: NotificationData[]
}

export interface NotificationCountData {
  currentCount: number
  parsedCurrentCount: number
}

export interface NotificationData {
  id: string
  timestamp: number
  message: string
}
