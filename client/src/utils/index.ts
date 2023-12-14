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
  cluster.refreshClusters()
}

// Icon size of the marker
export const MAP_MARKER_ICON_SIZE = 16

// SVG code for the marker icon
export const MAP_MARKER_ICON = `
<svg width="32px" height="32px" viewBox="0 0 24 24" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/">
<g transform="translate(0 -1028.4)">
  <path d="m12 0c-4.4183 2.3685e-15 -8 3.5817-8 8 0 1.421 0.3816 2.75 1.0312 3.906 0.1079 0.192 0.221 0.381 0.3438 0.563l6.625 11.531 6.625-11.531c0.102-0.151 0.19-0.311 0.281-0.469l0.063-0.094c0.649-1.156 1.031-2.485 1.031-3.906 0-4.4183-3.582-8-8-8zm0 4c2.209 0 4 1.7909 4 4 0 2.209-1.791 4-4 4-2.2091 0-4-1.791-4-4 0-2.2091 1.7909-4 4-4z" transform="translate(0 1028.4)" fill="#e74c3c"/>
  <path d="m12 3c-2.7614 0-5 2.2386-5 5 0 2.761 2.2386 5 5 5 2.761 0 5-2.239 5-5 0-2.7614-2.239-5-5-5zm0 2c1.657 0 3 1.3431 3 3s-1.343 3-3 3-3-1.3431-3-3 1.343-3 3-3z" transform="translate(0 1028.4)" fill="#c0392b"/>
</g></svg>`
