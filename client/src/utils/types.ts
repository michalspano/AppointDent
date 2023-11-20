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
  startTime: number
  endTime: number
  dentist: string // email
  id: string // arbitrary id
}

export interface Notification {
  message: string
  time: number
  email: string
  id?: string
}
