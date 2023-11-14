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
  dateOdBirth?: Date
  session?: {
    hash: string
    expiry?: Date
  }
}

export interface Dentist extends Patient {
  address: {
    street: string
    city: string
    zip: number
    houseNumber: string
    country: string
  }
  picture: string
}

/*
The start and end dates are timestamps in the backend. In my opinion,
the backend should convert them to date and then send them to the front-end
*/

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
