import axios from 'axios'
import type { Place, DentistRegistration, PatientRegistration } from '../../utils/types'

// Validity check for users before performing sign up

function isValidEmail (email: string): boolean {
  // Regex for checking email validation. Source: https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return email.match(emailRegex) !== null
}

function isValidPass (pass: string): boolean {
  // Regex for strong password. Source: https://stackoverflow.com/questions/12090077/javascript-regular-expression-password-validation-having-special-characters
  const strongPassRegEx = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/
  return pass.match(strongPassRegEx) !== null
}

function isValidName (fName: string, lName: string): boolean {
  return fName.trim() !== '' && lName.trim() !== ''
}

function isValidZip (zip: string): boolean {
  // Zip must be at least 5 digits
  const zipRegex = /^\d\d\d\d\d$/
  return zip.match(zipRegex) !== null && Number(zip) > 0
}

export function validateUserInfo (user: PatientRegistration | DentistRegistration): null | string {
  if (!isValidEmail(user.email)) {
    return 'Please provide a valid email address.'
  }
  if (!isValidPass(user.password)) {
    return 'Password must be at least 8 characters and contain at least one capital letter, lowercase letter, a digit, and one of "!, @, #, $, %, ^, &, *" characters'
  }
  if (!isValidName(user.firstName, user.lastName)) {
    return 'First name and last name cannot be empty.'
  }
  return null
}

export async function validateAddress (dentist: DentistRegistration): Promise<null | string> {
  if (!isValidZip(dentist.clinicZipCode)) {
    return 'Zip must be five digits and be greater than zero.'
  }
  if (Number(dentist.clinicHouseNumber) <= 0) {
    return 'House number must be greater than zero.'
  }
  const dentistCombinedAddress: string = dentist.clinicHouseNumber + ' ' + dentist.clinicStreet + ' ' + dentist.clinicZipCode + ' ' + dentist.clinicCity
  let result
  try {
    result = await axios.get(`https://geocode.maps.co/search?q=${dentistCombinedAddress}`)
  } catch (err) {
    console.log(err)
    return 'Please provide a valid address.'
  }
  // the address is saved as the first element in the data array returned by the API. This is the top choice provided by the API.
  const data: Place = result.data[0]
  if (data === undefined) {
    return 'Please provide a valid address.'
  }
  return null
}
