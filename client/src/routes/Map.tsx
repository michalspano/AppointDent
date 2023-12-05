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
      <form
        id='eventForm'
        class='z-10 flex flex-col justify-between items-center absolute top-20 right-5 p-4 bg-primary shadow-xl rounded'
        onSubmit={(event) => {
          event.preventDefault()
          handleFilterSubmit().catch(() => { console.error('Error selecting time interval.') })
        }}
      >
        <div
          class='absolute top-0 right-0 m-2 cursor-pointer text-white'
          onClick={() => setToShowFilter(!toShowFilter())}
      > {toShowFilter() ? 'X' : '●'} {/* TODO: fix this properly */}

        </div>
        {toShowFilter() && (
          <div>
          <div class='flex flex-col'>
          <label>Start:</label>
          <input
            required
            type='datetime-local'
            value={filterInterval().start}
            min={0} /* we don't know ahead how old appointments can be, hence only positive integers */
            onChange={(event) => setFilterInterval({ ...filterInterval(), start: event.target.value })}
            />
        </div>
        <div class='flex flex-col'>
          <label>End:</label>
          <input
            required
            type='datetime-local'
            value={filterInterval().end}
            min={filterInterval().start}
            onChange={(event) => setFilterInterval({ ...filterInterval(), end: event.target.value })}
            />
        </div>
        <div class='flex flex-col'>
          <button class='bg-secondary rounded text-white p-2 mt-3' type='submit'>Apply</button>
        </div>
        </div>
        )}
      </form>
    {/* Display the map component */}
    <div id="map" class="z-0"/>
  </>
}
