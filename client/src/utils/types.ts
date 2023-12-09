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
  clinicHouseNumber: string
  clinicZipCode: number
  picture: string
}

export interface Appointment {
  id: string
  title: string // The patient name (to work with fullcalendar, it has to be named title)
  start: string // The start time (to work with fullcalendar, it has to be named start)
  end: string// The end time (to work with fullcalendar, it has to be named end)
}

export interface Notification {
  message: string
  time: number
  email: string
  id?: string
}

export interface Registration {
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
