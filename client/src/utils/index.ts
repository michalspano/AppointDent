/**
 * client/src/utils/index.ts
 *
 * @description :: Utility functions for the client.
 * @version     :: 1.0
 */

import { Api } from '../utils/api'
import * as leaflet from 'leaflet'
import { UserType, type WhoisResponse } from '../utils/types'

/**
 * @description the default location of the map component.
 * This place is Gothenburg, Sweden.
 */
export const defaultLocation: Readonly<leaflet.MapOptions> = Object.freeze({
  center: new leaflet.LatLng(57.708870, 11.974560),
  zoom: 12
})

/**
 * Parse a date in the format of integer into a string.
 * @description to ensure that this function is not excessively used, it is only
 * to be used when making a request to the backend.
 *
 * @param dateString - A date in string format.
 * @returns A date in number format.
 */
export const parseDateStringToInt = (dateString: string): number => {
  const date: Date = new Date(dateString)
  const timestamp: number = date.getTime()
  return Math.floor(timestamp / 1000) // return the timestamp in seconds
}

/**
 * @description a helper function to determine the current user.
 * @returns Promise<WhoisResponse | null> - the response of the WHOIS topic.
 */
export const getUser = async (): Promise<WhoisResponse | null> => {
  try {
    return (await Api.get('/sessions/whois', { withCredentials: true })).data
  } catch (error: any) {
    console.error('Error getting user role', error)
    return null
  }
}

export const formatDate = function (date: Date): string {
  const parsedDate = date.toLocaleDateString().split('/')
  const year = parsedDate[2]
  parsedDate[2] = parsedDate[0]
  parsedDate[0] = year
  return parsedDate.toString().replace(/[\s,]/g, '-')
}

/**
 * @description a helper function to determine if the user is a patient or not.
 * @returns Promise<boolean> - true if the user is a patient, false otherwise.
 *
 * @see getUser
 */
export const isPatient = async (): Promise<boolean> => {
  try {
    const user: WhoisResponse = (await getUser()) as WhoisResponse
    if (user === null) return false
    return user.type === UserType.Patient
  } catch (error: any) {
    console.error('Error getting user role', error)
    return false
  }
}

/**
 * A function that fetches the patient's email address.
 * @returns the patient's email address in a string format.
 */
export async function fetchPatientEmail (): Promise<string> {
  let patientResponse: WhoisResponse
  try {
    patientResponse = (
      await Api.get('sessions/whois', { withCredentials: true })
    ).data
  } catch {
    throw new Error("Couldn't fetch patient's email address.")
  }
  return patientResponse.email as string
}

/**
 * @description a helper function to reset the given cluster group.
 * @param cluster the cluster group that needs to be reset
 */
export function resetCluster (cluster: leaflet.MarkerClusterGroup): void {
  cluster.clearLayers()
  cluster.clearAllEventListeners()
  cluster.refreshClusters()
}
