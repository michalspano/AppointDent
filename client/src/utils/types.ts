/*
Some attributes that I was not sure if the response payload will contain are
optional (using the question mark). Moreover, password is needed in signUp,
but not im MyProfile. Therefore, it is optional.
*/

export interface Patient extends Record<string, unknown> {
  userEmail: string
  password?: string
  name: {
    firstName: string
    lastName: string
  }
  dateOfBirth: Date
  session?: {
    hash: string
    expiry?: Date
  }
}

export interface Dentist extends Record<string, unknown> {
  userEmail: string
  password?: string
  name: {
    firstName: string
    lastName: string
  }
  session?: {
    hash: string
    expiry?: Date
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
  startTimestamp: Date
  endDate: Date
  dentist: string
  id: string
}

export interface Notification {
  message: string
  time: Date
  email: string
  id?: string
}
