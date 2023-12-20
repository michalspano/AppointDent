import 'leaflet.markercluster'
import * as leaflet from 'leaflet'
import { Api } from '../../utils/api'
import { MAP_MARKER_ICON, MAP_MARKER_ICON_SIZE, getUser, parseDateStringToInt } from '../../utils'
import { type Dentist, type FilterInterval, type AppointmentResponse } from '../../utils/types'

/**
 * This function has the responsibility of taking a user to the page where they
 * can see a dentist's appointments. Furthermore, it adds the additional functionality
 * of filtering the appointments by a time range.
 *
 * @param email email of the dentist to see appointments with
 * @param timeRange time range to filter the appointments by
 * @default undefined if no time range is specified
 */
function openAvailableSlots (email: string, timeRange?: FilterInterval): void {
  const DEFAULT_URL: string = '/book-appointment/' + btoa(email)

  // If the time range is not defined, redirect to the default url.
  if (timeRange === undefined) { window.location.replace(DEFAULT_URL); return }

  const from: number = parseDateStringToInt(timeRange.start)
  const to: number = parseDateStringToInt(timeRange.end)

  window.location.replace(`${DEFAULT_URL}?from=${from}&to=${to}`)
}

/**
 * We insert the marker into the cluster group
 * We add the event handler to initiate when a marker has been selected.
 * @param dentist dentist that is going to be inserted
 * @param markerCluster the cluster group which acts as a middleware
 *  between the map and the markers.
 * @param timeRange time range to filter the appointments by
 * @default undefined if no time range is specified
 *
 * TODO: extract hardcoded values to standalone variables/containers
 */
async function connectToCluster (dentist: Dentist, markerCluster: leaflet.MarkerClusterGroup, timeRange?: FilterInterval): Promise<void> {
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

  // The icon on the map
  const pinIcon = leaflet.divIcon({ className: 'pin', html: MAP_MARKER_ICON, iconAnchor: [MAP_MARKER_ICON_SIZE, MAP_MARKER_ICON_SIZE] })
  const pin = leaflet.marker([dentist.latitude, dentist.longitude], { icon: pinIcon })
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
    for (const dentist of dentists) {
      void connectToCluster(dentist, cluster)
    }
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
  const addedDentists: string[] = [] // This array prevent duplicate additions
  for (let i = 0; i < appointments.length; i++) {
    const dentist = dentists.find((dentist: Dentist) =>
      dentist.email === appointments[i].dentistId
    ) as Dentist
    // If dentist already added, skip iteration
    if (addedDentists.includes(dentist.email)) continue
    void connectToCluster(
      dentist,
      cluster,
      timeRange
    )
    addedDentists.push(dentist.email)
  }
}
