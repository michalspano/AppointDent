/**
 * @description An interface to represent a Patient.
 */
export interface Patient {
  email: string
  birthDate: number
  lastName: string
  firstName: string
}

/**
* @description an interface that represents a request over MQTT to
* get the name of a patient from their email.
*/
export interface PatientNameRequestMQTT {
  reqId: string
  email: string
}

/**
* @description an interface type that is yielded by the request.
* @see PatientNameRequestMQTT
*/
export interface PatientNameRequest {
  firstName: string
  lastName: string
}
