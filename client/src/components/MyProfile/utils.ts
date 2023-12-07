import type { Dentist, Place } from '../../utils/types'
import axios from 'axios'

// validity check for users before patching

export function isValidName (fName: string, lName: string): boolean {
  return fName.trim() !== '' && lName.trim() !== ''
}

function isValidZip (zip: string): boolean {
  // Zip must be at least 5 digits
  const zipRegex = /^\d\d\d\d\d$/
  return zip.match(zipRegex) !== null && Number(zip) > 0
}

/**
 * This method checks the validity of a address change that the dentist wants to perform
 * @param dentist the dentist object that dentist has changed address for and wants to save
 * @returns null if address change is valid; error message if the address change is not valid
 */
export async function validateAddress (dentist: Dentist): Promise<null | string> {
  if (!isValidZip(String(dentist.clinicZipCode))) {
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
