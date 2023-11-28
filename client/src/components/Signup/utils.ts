export function validateUserInfo (user: any): undefined | string {
  // Regex for checking email validation. Source: https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  // Regex for strong email. Source: https://stackoverflow.com/questions/12090077/javascript-regular-expression-password-validation-having-special-characters
  const strongEmailRegEx = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/
  const zipRegex = /^\d\d\d\d\d$/
  for (const key in user) {
    if (key === 'clinicZipCode') {
      if (String(user.key).match(zipRegex) == null || Number(user.key) < 0) {
        return 'Zip code must contain five digits and be greater than 0.'
      }
    }
    if (key === 'clinicHouseNumber') {
      if (Number(user.key) < 0) {
        return 'House number must be greater than 0.'
      }
    }
  }
  if (String(user.email).match(emailRegex) == null) {
    return 'Please provide a valid email address.'
  }
  if (String(user.password).match(strongEmailRegEx) == null) {
    return 'Password must be at least 8 characters and contain at least one capital letter, lowercase letter, a digit, and one of "!, @, #, $, %, ^, &, *" characters'
  }
  if (String(user.firstName).trim() === '' || String(user.lastName).trim() === '') {
    return 'First name and last name cannot be empty.'
  }
  return undefined
}
