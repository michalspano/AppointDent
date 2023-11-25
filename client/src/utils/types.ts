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
  userEmail: string
  password?: string
  name: {
    firstName: string
    lastName: string
  }
  dateOfBirth: Date
  session?: {
    token: string
    expiry?: Date
  }
}

export interface Dentist {
  userEmail: string
  password?: string
  name: {
    firstName: string
    lastName: string
  }
  session?: {
    token: string
    expiry?: number
  }
  address: {
    street: string
    city: string
    zip: number
    houseNumber: string
    country: string
  }
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
