import '../assets/leaflet.css'
import '../components/Map/map.css'
import * as leaflet from 'leaflet'
import { useNavigate } from '@solidjs/router'
import { createEffect, createSignal } from 'solid-js'
import { type JSX, onMount, type Signal } from 'solid-js'
import { type FilterInterval } from '../utils/types'
import { addDentistsToCluster } from '../components/Map/dentists'
import { isPatient, defaultLocation, resetCluster } from '../utils'

export default function Map (): JSX.Element {
  const navigate = useNavigate()

  const [toShowFilter, setToShowFilter]: Signal<boolean> = createSignal<boolean>(true)
  const [filterInterval, setFilterInterval]: Signal<FilterInterval> = createSignal<FilterInterval>({
    start: '', end: ''
  })
  // Cluster that holds all dentists as 'markers'
  const [cluster]: Signal<leaflet.MarkerClusterGroup> = createSignal<leaflet.MarkerClusterGroup>(
    leaflet.markerClusterGroup({ maxClusterRadius: 80 })
  )

  /**
   * Handles the filter submit event. It resets the current cluster
   * and adds the dentists that are available in the given time interval.
   */
  async function handleFilterSubmit (): Promise<void> {
    resetCluster(cluster())
    void addDentistsToCluster(cluster(), filterInterval())
  }

  /**
   * This function is called when the filter interval is reset.
   * So, the all possible dentists are added to the cluster.
   */
  async function handleReset (): Promise<void> {
    resetCluster(cluster())
    void addDentistsToCluster(cluster())
  }

  /**
   * Ensures that the user is a patient, otherwise redirect to calendar.
   */
  createEffect(async () => {
    const authResult: boolean = await isPatient()
    if (!authResult) navigate('/calendar', { replace: true })
  })

  onMount(() => {
    /**
     * Initialize map with Coordinates of Gothenburg (Sweden)
     */
    const map = new leaflet.Map('map', defaultLocation)
    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
    /**
     * Add the cluster that holds all dentists
     */
    map.addLayer(cluster())
    /**
     * Add all dentists to the map; in the initial call, all dentists are fetched from the database.
     * However, the filter can be applied later to filter the dentists.
     */
    void addDentistsToCluster(cluster())
  })
  return <>
    <div class="z-10 flex flex-col justify-between items-center absolute top-20 right-5 p-4 bg-primary shadow-xl rounded">
      <form
        id='eventForm'
        onReset={() => {
          handleReset().catch(() => {
            console.error('Error resetting filter.')
          })
        }}
        onSubmit={(event) => {
          event.preventDefault()
          handleFilterSubmit().catch(() => {
            console.error('Error selecting time interval.')
            void handleReset() // Revert to the default state
          })
        }}
      >
        <div
          class='cursor-pointer text-white'
          // The 'X' is displayed at the top right corner of the filter form
          classList={{ 'absolute top-0 right-0 m-2 ': toShowFilter() }}
          onClick={() => setToShowFilter(!toShowFilter())}
        >
          {toShowFilter() ? 'X' : 'Filter'}
        </div>
        {toShowFilter() && (
          // Grouped in a div to enable conditional rendering of the whole region
          // TODO: add validation for the maximum date not to exhaust the server
          <div>
            <div class='flex flex-col'>
              <label class='text-white'>Start:</label>
              <input
                required
                type='datetime-local'
                value={filterInterval().start}
                min={0} /* we don't know ahead how old appointments can be, hence only positive integers */
                onChange={(event) => setFilterInterval({ ...filterInterval(), start: event.target.value })}
              />
            </div>
            <div class='flex flex-col'>
              <label class='text-white'>End:</label>
              <input
                required
                type='datetime-local'
                value={filterInterval().end}
                min={filterInterval().start}
                onChange={(event) => setFilterInterval({ ...filterInterval(), end: event.target.value })}
              />
            </div>
            <div class="inline-flex w-full mt-4">
              <button class='w-1/2 bg-secondary rounded text-white p-2' type='submit'>Apply</button>
              <button class='w-1/2 ml-2 bg-grey rounded text-transparent-black p-2' type='reset'>Reset</button>
            </div>
          </div>
        )}
      </form>
    </div>
    {/* Display the map component */}
    <div id="map" class="z-0" />
  </>
}
