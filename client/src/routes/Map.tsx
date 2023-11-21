import { type JSX, onMount } from 'solid-js'
import * as leaflet from 'leaflet'
import '../components/Map/map.css'
import '../assets/leaflet.css'
import { addDentistsToMap } from '../components/Map/dentists'

export default function Map (): JSX.Element {
  onMount(() => {
    /**
     * Initialize map with gothenburg coordinates
     */
    const map = new leaflet.Map('map', { center: new leaflet.LatLng(57.708870, 11.974560), zoom: 12 })
    /**
     * Add map picture
     */
    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
    /**
     * Add all dentists to the map
     */
    void addDentistsToMap(map)
  })
  return <>
  <div id="map"></div>
  </>
}
