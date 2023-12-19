/**
 * @description an interface that represents a dentist.
 */
export interface Dentist {
  email: string
  firstName: string
  lastName: string
  clinicCountry: string
  clinicCity: string
  clinicStreet: string
  clinicHouseNumber: number
  clinicZipCode: number
  picture: string
  longitude: number
  latitude: number
}

/**
 * @description an interface that represents a login request.
 */
export interface LoginRequest {
  email: string
  password: string
}

/**
 * @description iteration through the RegisterRequest keys
 */
export type DentistField = keyof Dentist;

/**
 * @description an interface that represents a request over MQTT to
 * get the name of a dentist from their email.
 */
export interface DenNameRequestMQTT {
  reqId: string
  email: string
}

/**
 * @description an interface type that is yielded by the request.
 * @see DenNameRequestMQTT
 */
export interface DenNameRequest {
  firstName: string
  lastName: string
}
