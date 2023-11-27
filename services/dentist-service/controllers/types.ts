export interface RegisterRequest {
  'email': string
  'firstName': string
  'lastName': string
  'clinicCountry': string
  'clinicCity': string
  'clinicStreet': string
  'clinicHouseNumber': number
  'clinicZipCode': number
  'picture': string
}
export type RegisterRequestKey = keyof RegisterRequest; // Used when iterating through the RegisterRequest
