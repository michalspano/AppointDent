import type { Dentist, Patient } from '../../utils/types'

// validity check for users before patching

/**
 * This method checks the validity of a patch that the dentist wants to perform
 * @param dentist the dentist object that dentist has changed and wants to save
 * @returns undefined if dentist is valid; error.message if the dentist is not valid
 */
export function isValidDentist (dentist: Dentist): undefined | string {
  try {
    if (dentist.address.zip <= 0) {
      throw new Error('Zip should have a value greater than 0')
    }

    // RegEx expression to check email validity
    // source: https://www.tutorialspoint.com/how-to-validate-email-address-using-regexp-in-javascript
    if (dentist.userEmail.match(/^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/) == null) {
      throw new Error('Please give a valid email address.')
    }

    if (dentist.name.firstName === '' || dentist.name.lastName === '') {
      throw new Error('Please write your first and last name.')
    }
  } catch (err) {
    return (err as Error).message
  }

  return undefined
}

/**
 * This method checks the validity of a patch that the patient wants to perform
 * @param patient the patient object that dentist has changed and wants to save
 * @returns undefined if patient is valid; error.message if the patient is not valid
 */
export function isValidPatient (patient: Patient): undefined | string {
  try {
    if (patient.firstName === '' || patient.lastName === '') {
      throw new Error('Please write your first and last name.')
    }
  } catch (err) {
    return (err as Error).message
  }

  return undefined
}
