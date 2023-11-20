import axios from 'axios'
import * as leaflet from 'leaflet'

interface Coordinate {
  long: number
  lat: number
}

interface Dentist {
  name: string
  address: string
  picture: string
}

interface Place {
  boundingBox: [string, string, string, string]
  class: string
  displayName: string
  importance: number
  lat: string
  licence: string
  lon: string
  osmId: number
  osmType: string
  placeId: number
  poweredBy: string
  type: string
}

async function geoCodeAddress (address: string): Promise<Place> {
  if (address.length === 0) throw Error('Address cannot be empty!')
  return await new Promise((resolve, reject) => {
    axios.get(`https://geocode.maps.co/search?q=${address}`).then((result) => {
      const data: Place = result.data[0]
      console.log(data)
      resolve(data)
    }).catch((err) => {
      console.error(err)
    })
  })
}

async function addNewDentist (dentist: Dentist, map: leaflet.Map): Promise<void> {
  geoCodeAddress('Kakelösagatan 61 43144 Mölndal').then((result: Place) => {
    console.log(result)
    const pictureAndName = `<div class="flex flex-wrap items-center"><div class="picture"><img class="dentistProfileMap" src="${dentist.picture}"></div><div class="details"><p>${dentist.name}</p><p>${dentist.address}</p></div>  </div>`
    const customHtml = `<div class="dentistMarker">${pictureAndName}</div>`
    const svgIcon = `
    <svg width="32px" height="32px" viewBox="0 0 24 24" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/">
 <g transform="translate(0 -1028.4)">
  <path d="m12 0c-4.4183 2.3685e-15 -8 3.5817-8 8 0 1.421 0.3816 2.75 1.0312 3.906 0.1079 0.192 0.221 0.381 0.3438 0.563l6.625 11.531 6.625-11.531c0.102-0.151 0.19-0.311 0.281-0.469l0.063-0.094c0.649-1.156 1.031-2.485 1.031-3.906 0-4.4183-3.582-8-8-8zm0 4c2.209 0 4 1.7909 4 4 0 2.209-1.791 4-4 4-2.2091 0-4-1.791-4-4 0-2.2091 1.7909-4 4-4z" transform="translate(0 1028.4)" fill="#e74c3c"/>
  <path d="m12 3c-2.7614 0-5 2.2386-5 5 0 2.761 2.2386 5 5 5 2.761 0 5-2.239 5-5 0-2.7614-2.239-5-5-5zm0 2c1.657 0 3 1.3431 3 3s-1.343 3-3 3-3-1.3431-3-3 1.343-3 3-3z" transform="translate(0 1028.4)" fill="#c0392b"/>
 </g>
</svg>`
    const customIcon = leaflet.divIcon({
      className: 'svg-icon',
      html: svgIcon,
      iconAnchor: [16, 16]
    })
    const marker = leaflet.marker([parseFloat(result.lat), parseFloat(result.lon)], { icon: customIcon }).addTo(map)

    marker.bindPopup(customHtml, {
      className: 'custom-popup'
    })
  }).catch((err) => {
    console.error(err)
  })
}

export async function addDentistsToMap (map: leaflet.Map): Promise<void> {
  const dentist: Dentist = {
    name: 'Alex',
    address: 'Kakelösagatan 61 43144 Mölndal',
    picture: 'data:image/png;base64,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'
  }

  void addNewDentist(dentist, map)
}
