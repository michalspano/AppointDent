// import { type JSX } from 'solid-js/jsx-runtime'
import logo from '../../../assets/logo.png'
import { type Dentist } from '../../../utils/types'
import { createStore } from 'solid-js/store'
import { createSignal, type JSX } from 'solid-js'
import Navbar from '../../Navbar/Navbar'
import axios from 'axios'
import { type AxiosResponse } from 'axios'

interface DentistProfileProps {
  dentistProp: Dentist
}

function isValidDentist (dentist: Dentist): boolean {
  if (dentist.address.zip <= 0) {
    console.log(false)
    return false
  }
  // RegEx expression to check email validity
  // source: https://www.tutorialspoint.com/how-to-validate-email-address-using-regexp-in-javascript
  if (dentist.userEmail.match(/^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/) == null) {
    console.log(false)
    return false
  }
  if (dentist.name.firstName === '' || dentist.name.lastName === '') {
    console.log(false)
    return false
  }
  return true
}

export default function DentistProfile (dentistProp: DentistProfileProps): JSX.Element {
  const [dentist, setDentist] = createStore<Dentist>(dentistProp.dentistProp)
  const [proImage, setProImage] = createSignal<string>(dentist.picture)
  const [getError, setError] = createSignal<Error | null>(null)
  const uploadProPic = function (target: HTMLInputElement): void {
    const files = target.files
    console.log(files)
    console.log(typeof files)
    if (files !== null && files !== undefined && files.length > 0) {
      console.log(files[0].type)
      const file = files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result
        console.log(result)
        if (result !== null) {
          if (typeof result === 'string') {
            setProImage(result)
            console.log(proImage())
          }
        }
      }
      reader.readAsDataURL(file)
    }
  }
  const patchDentist = function patchDentist (patchedDentist: Dentist): void {
    if (!isValidDentist(dentist)) {
      setError(new Error('Please provide valid credentials'))
      return
    }
    const url = `/dentist/${patchedDentist.userEmail}`
    axios.patch<Dentist, AxiosResponse<Dentist>, Dentist>(url, patchedDentist)
      .then(result => { setDentist(result.data) })
      .catch(err => {
        setDentist(dentistProp.dentistProp)
        setProImage(dentistProp.dentistProp.picture)
        console.log(err)
      })
  }
  return <>
    <div class="h-auto w-full bg-white flex lg:flex-row flex-col items-center justify-center">
      <div class='lg:h-full lg:w-1/2 w-full h-1/4 flex flex-col  bg-primary'>
        <div class='flex items-top justify-center'>
          <Navbar/>
        </div>
        <div class='flex items-center justify-center'>
          <img class='lg:w-5/6 w-1/5 h-auto lg:rounded-sm rounded-full' src={proImage()} alt='profile image' />
        </div>
      </div>
      <div class="lg:w-1/2 w-5/6 h-screen flex flex-col text-black rounded-sm bg-gradient-to-b from-neutral ... lg:px-10 px-5 py-3 text-sm font-medium">
        <div class="flex flex-col items-center justify-center">
          <img class="w-40 " src={logo} alt="AppointDent" />
        </div>
          <h1 class="mb-2 mt-4 text-lg">{dentist.name.firstName}'s Profile</h1>
          <input
          class="input h-12 px-3 py-2 mb-3 border rounded-xl"
          type="text"
          value={dentist.userEmail}
          onChange={(event) => { setDentist('userEmail', event.target.value) }}
          />
          <div class="flex flex-row">
            <input
              class="input h-12 w-full px-3 py-2 mb-3 md:mb-0 mr-2 border rounded-xl"
              type="text"
              value={dentist.name.firstName}
              onChange={(event) => { setDentist('name', 'firstName', event.target.value) }}
            />
            <input
              class="input h-12 w-full px-3 py-2 mb-3 border rounded-xl"
              type="text"
              value={dentist.name.lastName}
              onChange={(event) => { setDentist('name', 'lastName', event.target.value) }}
            />
          </div>
          <label class="block pl-2 text-xs font-extralight pb-1">
                Address of the clinic
          </label>
          <div class="flex flex-row">
            <input
              class="input h-12 w-full px-3 py-2 mb-3  mr-2  border rounded-xl"
              type="text"
              value={dentist.address.city}
              onChange={(event) => { setDentist('address', 'city', event.target.value) }}
            />
            <input
              class="input h-12 w-full px-3 py-2 mb-3  border rounded-xl"
              type="text"
              value={dentist.address.street}
              onChange={(event) => { setDentist('address', 'street', event.target.value) }}
            />
          </div>
          <div class="flex flex-row">
            <input
              class="input h-12 w-full px-3 py-2 mb-3  mr-2  border rounded-xl"
              type="text"
              value={dentist.address.houseNumber}
              onChange={(event) => { setDentist('address', 'houseNumber', event.target.value) }}
            />
            <input
              class="input h-12 w-full px-3 py-2 mb-3  border rounded-xl"
              type="number"
              value={String(dentist.address.zip)}
              onChange={(event) => { setDentist('address', 'zip', Number(event.target.value)) }}
            />
          </div>
          <input
              class="input h-12 w-full px-3 py-2 mb-6  border rounded-xl"
              type="file"
              accept=".jpeg, .jpg, .png"
              value="Upload a profile image"
              onChange={(event) => { uploadProPic(event.target) }}
          />
          {getError() !== null ? <p class="text-error">{(getError() as Error).message}</p> : <></>}
          <button type="submit" class="log-in-btn h-12 mb-6 bg-secondary rounded-xl text-base" onClick={() => { patchDentist(dentist) }}>
             Save changes
          </button>
      </div>
    </div>
  </>
}
