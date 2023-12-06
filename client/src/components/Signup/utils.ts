import axios from 'axios'
import type { Place, DentistRegistration, PatientRegistration } from '../../utils/types'

function validateEmail (email: string): boolean {
  // Regex for checking email validation. Source: https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (email.match(emailRegex) == null) {
    return false
  }
  return true
}

function validatePass (pass: string): boolean {
  // Regex for strong password. Source: https://stackoverflow.com/questions/12090077/javascript-regular-expression-password-validation-having-special-characters
  const strongPassRegEx = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/
  if (pass.match(strongPassRegEx) == null) {
    return false
  }
  return true
}

function validateName (fName: string, lName: string): boolean {
  if (fName.trim() === '' || lName.trim() === '') {
    return false
  }
  return true
}

function validateZip (zip: string): boolean {
  const zipRegex = /^\d\d\d\d\d$/
  if (zip.match(zipRegex) == null || Number(zip) <= 0) {
    return false
  }
  return true
}

export function validateUserInfo (user: PatientRegistration | DentistRegistration): null | string {

  if (!validateEmail(user.email)) {
    return 'Please provide a valid email address.'
  }
  if (!validatePass(user.password)) {
    return 'Password must be at least 8 characters and contain at least one capital letter, lowercase letter, a digit, and one of "!, @, #, $, %, ^, &, *" characters'
  }
  if (!validateName(user.firstName, user.lastName)) {
    return 'First name and last name cannot be empty.'
  }
  return null
}

export async function validateAddress (dentist: DentistRegistration): Promise<null | string> {
  if(!validateZip(dentist.clinicZipCode)) {
    return 'Zip must be five digits and be greater than zero.'
  }
  if (Number(dentist.clinicHouseNumber) <= 0) {
    return 'House number must be greater than zero.'
  }
  const dentistCombinedAddress: string = dentist.clinicHouseNumber + ' ' + dentist.clinicStreet + ' ' + dentist.clinicZipCode + ' ' + dentist.clinicCity
  console.log(dentistCombinedAddress)
  let result
  try {
    result = await axios.get(`https://geocode.maps.co/search?q=${dentistCombinedAddress}`)
    console.log(result)
  } catch (err) {
    console.log(err)
    return 'Please provide a valid address.'
  }
  const data: Place = result.data[0]
  console.log(data)
  if (data === undefined) {
    return 'Please provide a valid address.'
  }
  return null
}
