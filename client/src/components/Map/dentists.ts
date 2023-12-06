import axios from 'axios'
import 'leaflet.markercluster'
import * as leaflet from 'leaflet'
import { Api } from '../../utils/api'
import { getUser, parseDateStringToInt } from '../../utils'
import { type Place, type Dentist, type FilterInterval, type AppointmentResponse } from '../../utils/types'

/**
 * Used to convert addresses into long and lat for the map.
 * @param address the address that needs to be geocoded
 * @returns a location in accordance with Geocode API
 */
async function geoCodeAddress (address: string): Promise<Place> {
  if (address.length === 0) throw Error('Address cannot be empty!')
  return await new Promise((resolve, reject) => {
    axios.get(`https://geocode.maps.co/search?q=${address}`).then((result) => {
      const data: Place = result.data[0]
      resolve(data)
    }).catch((err) => {
      console.error(err)
      reject(err)
    })
  })
}

/**
 * This function has the responsibility of taking a user to the page where they
 * can see a dentist's appointments. Furthermore, it adds the additional functionality
 * of filtering the appointments by a time range.
 * 
 * @param email email of the dentist to see appointments with
 * @param timeRange time range to filter the appointments by
 * @default undefined if no time range is specified
 */
function openAvailableSlots(email: string, timeRange?: FilterInterval): void {
  const DEFAULT_URL: string = '/book-appointment/' + btoa(email)

  // If the time range is not defined, redirect to the default url.
  if (timeRange === undefined) { window.location.replace(DEFAULT_URL); return }

  const from: number = parseDateStringToInt(timeRange.start)
  const to: number = parseDateStringToInt(timeRange.end)

  window.location.replace(`${DEFAULT_URL}?from=${from}&to=${to}`)
}

/**
 * In this function we geocode the address as well as insert the marker into the cluster group
 * We add the event handler to initiate when a marker has been selected.
 * @param dentist dentist that is going to be inserted
 * @param markerCluster the cluster group which acts as a middleware
 *  between the map and the markers.
 * @param timeRange time range to filter the appointments by
 * @default undefined if no time range is specified
 * 
 * TODO: extract hardcoded values to standalone variables/containers
 */
async function addNewDentist(dentist: Dentist, markerCluster: leaflet.MarkerClusterGroup, timeRange?: FilterInterval): Promise<void> {
  const dentistCombinedAddress: string = dentist.clinicStreet + ' ' + dentist.clinicHouseNumber + ' ' + dentist.clinicZipCode + ' ' + dentist.clinicCity
  geoCodeAddress(dentistCombinedAddress).then((result: Place) => {
    const dentistCard = `
    <div class="flex flex-wrap items-center gap-4">
      <div class="picture">
        <img class="dentistProfileMap" src="${dentist.picture}">
      </div>
      <div class="details"><p>${dentist.firstName} ${dentist.lastName}</p>
        <p>${dentist.clinicStreet} ${dentist.clinicHouseNumber}</p>
        <p>${dentist.clinicZipCode} ${dentist.clinicCity}</p>
        <button id="showSlotsButton" value="${dentist.email}" class="showSlots mt-2 px-2 text-white w-full py-1 bg-secondary rounded-xl text-base">See slots</button>
      </div>
    </div>`

    // The combined html element that is rendered in the popup
    const combinedEl = `<div class="dentistMarker">${dentistCard}</div>`
    // The map icon
    const svgIcon = `
    <svg width="32px" height="32px" viewBox="0 0 24 24" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/">
    <g transform="translate(0 -1028.4)">
      <path d="m12 0c-4.4183 2.3685e-15 -8 3.5817-8 8 0 1.421 0.3816 2.75 1.0312 3.906 0.1079 0.192 0.221 0.381 0.3438 0.563l6.625 11.531 6.625-11.531c0.102-0.151 0.19-0.311 0.281-0.469l0.063-0.094c0.649-1.156 1.031-2.485 1.031-3.906 0-4.4183-3.582-8-8-8zm0 4c2.209 0 4 1.7909 4 4 0 2.209-1.791 4-4 4-2.2091 0-4-1.791-4-4 0-2.2091 1.7909-4 4-4z" transform="translate(0 1028.4)" fill="#e74c3c"/>
      <path d="m12 3c-2.7614 0-5 2.2386-5 5 0 2.761 2.2386 5 5 5 2.761 0 5-2.239 5-5 0-2.7614-2.239-5-5-5zm0 2c1.657 0 3 1.3431 3 3s-1.343 3-3 3-3-1.3431-3-3 1.343-3 3-3z" transform="translate(0 1028.4)" fill="#c0392b"/>
    </g></svg>`
    // The icon on the map
    const pinIcon = leaflet.divIcon({ className: 'pin', html: svgIcon, iconAnchor: [16, 16] })
    const pin = leaflet.marker([parseFloat(result.lat), parseFloat(result.lon)], { icon: pinIcon })
    // Bind the html to be rendered upon interaction with pin
    pin.bindPopup(combinedEl, { className: 'dentist' })
    markerCluster.addLayer(pin)
    /**
     * We wait until the popup is open, before we attach event handler. Otherwise it will not fire properly
     */
    pin.on('popupopen', () => {
      const showSlotsButton = document.getElementById('showSlotsButton')
      showSlotsButton?.addEventListener('click', (e) => {
        // Pass the time range if it is defined.
        timeRange === undefined
          ? openAvailableSlots((e.target as HTMLInputElement)?.value)
          : openAvailableSlots((e.target as HTMLInputElement)?.value, timeRange)
      })
    })
  }).catch((err) => {
    console.error(err)
  })
}

/**
 * This function calls the dentist API and plots them on a map.
 * Furthermore, it can filter the dentists by a time range of their appointments.
 *
 * @param map leaflet map
 * @param timeRange time range to filter the dentists by
 * @default undefined if no time range is specified
 */
export async function addDentistsToCluster (cluster: leaflet.MarkerClusterGroup, timeRange?: FilterInterval): Promise<void> {
  // Get all dentists from the API
  let dentists: Dentist[]
  try {
    dentists = (await Api.get('dentists')).data as Dentist[]
  } catch (error: any) {
    alert('Problem with getting dentists...')
    console.error(error)
    return
  }

  // No time range is given, proceed to add all dentists
  if (timeRange === undefined) {
    for (const dentist of dentists) void addNewDentist(dentist, cluster)
    return
  }

  // If the time range is specified, proceed to apply the filter
  let appointments: AppointmentResponse[]
  try {
    // Parse the values required for the API call.
    const userId: string = (await getUser())?.email as string
    const from: number = parseDateStringToInt(timeRange.start)
    const to: number = parseDateStringToInt(timeRange.end)

    const query: string = `appointments/?userId=${userId}&from=${from}&to=${to}`
    appointments = (await Api.get(query, { withCredentials: true }
    )).data as AppointmentResponse[]
  } catch (error: any) {
    alert('Problem with filtering appointments...')
    console.error(error)
    return
  }

  // Retain dentists that have an appointment in within the specified
  // time range.
  appointments.forEach((appointment: AppointmentResponse) => {
    void addNewDentist(
      dentists.find((dentist: Dentist) =>
        dentist.email === appointment.dentistId
      ) as Dentist,
      cluster,
      timeRange
    )
  })
}
