import type { Dentist, Place } from '../../utils/types'
import axios from 'axios'

// validity check for users before patching

/**
 * This method checks the validity of a patch that a user (dentist or patient) wants to perform
 * @param user the user object that the user has changed and wants to save
 * @returns undefined if the change is valid; error message if the change is not valid
 */
export function validateUserInfo (user: any): undefined | string {
  const zipRegex = /^\d\d\d\d\d$/
  for (const key in user) {
    if (key === 'clinicZipCode') {
      if (String(user.clinicZipCode).match(zipRegex) == null || Number(user.key) < 0) {
        return 'Zip code must contain five digits and be greater than 0.'
      }
    }
    if (key === 'clinicHouseNumber') {
      if (Number(user.clinicHouseNumber) < 0) {
        return 'House number must be greater than 0.'
      }
    }
  }
  if (String(user.firstName).trim() === '' || String(user.lastName).trim() === '') {
    return 'First name and last name cannot be empty.'
  }
  return undefined
}

/**
 * This method checks the validity of a address change that the dentist wants to perform
 * @param dentist the dentist object that dentist has changed address for and wants to save
 * @returns undefined if address change is valid; error message if the address change is not valid
 */
export async function validateAddress (dentist: Dentist): Promise<undefined | string> {
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
  return undefined
}
