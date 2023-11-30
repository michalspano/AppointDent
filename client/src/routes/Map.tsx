import { type JSX, onMount } from 'solid-js'
import * as leaflet from 'leaflet'
import '../components/Map/map.css'
import '../assets/leaflet.css'
import { addDentistsToMap } from '../components/Map/dentists'
import { Api } from '../utils/api'
import { useNavigate } from '@solidjs/router'
import { createEffect } from 'solid-js'
import { UserType, type WhoisResponse } from '../utils/types'

export default function Map (): JSX.Element {
  const navigate = useNavigate()

  const isPatient = async (): Promise<boolean> => {
    try {
      const response: WhoisResponse = (await Api.get('/sessions/whois', { withCredentials: true })).data
      if (response.type === UserType.Patient) {
        return true
      } else {
        return false
      }
    } catch (error: any) {
      console.error('Error getting user role', error)
      return false
    }
  }

  createEffect(async () => {
    const authResult: boolean = await isPatient()
    if (!authResult) {
      navigate('/calendar', { replace: true })
    }
  })
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
