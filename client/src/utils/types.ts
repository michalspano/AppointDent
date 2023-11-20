/*
Some attributes that I was not sure if the response payload will contain are
optional (using the question mark). Moreover, password is needed in signUp,
but not im MyProfile. Therefore, it is optional.
*/

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
  dentist: string
  id: string
}

export interface Notification {
  message: string
  time: number
  email: string
  id?: string
}
