export interface Dentist {
  email: string
  pass: string
  fName: string
  lName: string
  clinic_country: string
  clinic_city: string
  clinic_street: string
  clinic_house_number: number
  clinic_zipcode: number
  picture: string
}

export interface RegistrationRequestBody {
  email: string
  pass: string
  fName: string
  lName: string
  clinicCountry: string
  clinicCity: string
  clinicStreet: string
  clinicHouseNumber: string
  clinicZipCode: string
  picture: string
}
