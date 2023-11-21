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
    hash: string
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
