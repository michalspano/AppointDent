import { type JSX } from 'solid-js/jsx-runtime'
import logo from '../../../assets/logo.png'
import { A } from '@solidjs/router'
import { createSignal } from 'solid-js'
import { Api } from '../../../utils/api'
import type { DentistRegistration, Country, Place } from '../../../utils/types'
import { validateAddress, validateUserInfo } from '../utils'
import { AxiosError } from 'axios'
import * as CountryList from 'country-list'

export default function DentistForm (): JSX.Element {
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [firstName, setFirstName] = createSignal('')
  const [lastName, setLastName] = createSignal('')
  const [clinicCity, setClinicCity] = createSignal('')
  const [clinicCountry, setClinicCountry] = createSignal('')
  const [clinicStreet, setClinicStreet] = createSignal('')
  const [clinicHouseNumber, setClinicHouseNumber] = createSignal('')
  const [clinicZipCode, setClinicZipcode] = createSignal('')
  const [picture, setPicture] = createSignal('')
  const [error, setError] = createSignal<string | null>(null)

  const allCountriesNames = CountryList.getNameList()
  const allCountries: Country[] = []
  for (const key in allCountriesNames) {
    allCountries.push({ name: key, code: CountryList.getCode(key) as string })
  }

  const signUp = async (): Promise<void> => {
    let registrationData: DentistRegistration = {
      email: email(),
      password: password(),
      firstName: firstName(),
      lastName: lastName(),
      clinicCountry: clinicCountry(),
      clinicCity: clinicCity(),
      clinicStreet: clinicStreet(),
      clinicHouseNumber: clinicHouseNumber(),
      clinicZipCode: clinicZipCode(),
      picture: picture(),
      longitude: undefined,
      latitude: undefined
    }
    if (Object.values(registrationData).some((field) => field === '')) {
      setError('Please fill in all fields.')
      return
    }
    if (validateUserInfo(registrationData) !== null) {
      setError(validateUserInfo(registrationData) as string)
      return
    }
    const addressValidation = await validateAddress(registrationData)
    if (addressValidation !== null) {
      setError(addressValidation)
      return
    }
    let useAPI: number = 0
    /**
     * Each geocoder has the capacity of at least 1 request per second.
     * Hence, the delay for cooldown, is calculated as:
     * 1000 / length of geocoders
    */
    const geoCoders: string[] = [
      'https://us1.locationiq.com/v1/search?key=pk.6e69ae53772e50aa2508ef9f652ee483&format=json&q=**ADDRESS**',
      'https://geocode.maps.co/search?q=**ADDRESS**',
      'https://nominatim.openstreetmap.org/search.php?format=jsonv2&q=**ADDRESS**'
    ]
    const geoCache: Record<string, Place> = {}
    const API_THROTTLE: number = 1000 / geoCoders.length
    const lastApiCallTimestamp: number = 0

    // Check if API throttle delay is needed
    const currentTimestamp = Date.now()
    const timeSinceLastCall = currentTimestamp - lastApiCallTimestamp
    if (timeSinceLastCall < API_THROTTLE) {
      await new Promise((resolve) => setTimeout(resolve, API_THROTTLE - timeSinceLastCall))
    }
    /**
     * Used to convert addresses into long and lat for the map.
     * @param address the address that needs to be geocoded
     * @returns a location in accordance with Geocode API
    */
    async function geoCodeAddress (address: string): Promise<Place> {
      if (address.length === 0) throw Error('Address cannot be empty!')
      console.log(geoCache, address, geoCache[address])
      if (geoCache[address] !== undefined && geoCache[address] !== null) {
        return geoCache[address]
      }
      return await new Promise((resolve, reject) => {
        Api.get(geoCoders[useAPI].replace('**ADDRESS**', address)).then((result) => {
          const data: Place = result.data[0]
          resolve(data)
          geoCache[address] = data
          if ((useAPI + 1) === geoCoders.length) {
            useAPI = 0
          } else {
            useAPI++
          }
        }).catch(async (err) => {
          reject(new Error('Geocoding system fatal error'))
          console.error(err)
        })
      })
    }
    const dentistCombinedAddress: string = clinicStreet() + ' ' + clinicHouseNumber() + ' ' + clinicZipCode() + ' ' + clinicCity()
    geoCodeAddress(dentistCombinedAddress)
      .then(async (result: Place) => {
        registrationData = { ...registrationData, longitude: parseFloat(result.lat), latitude: parseFloat(result.lon) }
        return await Api.post('/dentists/register', registrationData)
      })
      .then(async () => {
      // enable automatic login when user registers
        await login()
      })
      .catch((error: any) => {
        const resError: string | AxiosError = error instanceof AxiosError ? error : 'Something went wrong, Please try again.'
        if (resError instanceof AxiosError) {
          if (resError.response !== undefined) {
            setError(resError.response.data as string)
          }
        } else {
          setError(resError)
        }
        console.error('Error during sign up', error)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const signUpWrapper = (): void => {
    void signUp()
  }

  const handleUpload = async (): Promise<string> => {
    const fileInput: HTMLInputElement | null = document.querySelector('input[type=file]')

    if (fileInput != null) {
      if (fileInput.files != null) {
        const file = fileInput?.files[0]
        const reader = new FileReader()
        const baseString = await new Promise<string | ArrayBuffer | null>((resolve) => {
          reader.onloadend = function () {
            resolve(reader.result)
          }
          reader.readAsDataURL(file)
        })
        return baseString as string ?? ''
      }
    }
    throw new Error('File input element not found.')
  }

  const login = async (): Promise<void> => {
    try {
      await Api.post('/dentists/login', { email: email(), password: password() }, { withCredentials: true })
        .then(() => {
        // navigate to logged in view
          window.location.replace('/calendar')
        })
    } catch (error) {
      setError('Something went wrong, try again.')
      console.error('Error during login:', error)
    }
  }

  return <>
  <div class="h-full w-full bg-white flex flex-col items-center justify-center">
        <div class="lg:w-3/4 w-5/6 flex flex-col text-black rounded-sm bg-gradient-to-b from-neutral ... lg:px-10 px-5 py-3 text-sm font-medium">
            <div class="flex items-center justify-center">
                <img class="w-40 " src={logo} alt="AppointDent" />
            </div>
            <h1 class="mb-2 mt-4 text-lg">Create a dentist account</h1>
            <p class="mb-6 font-extralight">Welcome to AppointDent! Sign up as a dentist. </p>
          <input
          class="input h-12 px-3 py-2 mb-3 border rounded-xl"
          type="text"
          placeholder="Email"
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          class="input h-12 px-3 py-2 mb-3 border rounded-xl"
          type="password"
          placeholder="Password"
          onChange={(event) => setPassword(event.target.value)}
        />
          <div class="flex flex-row">
            <input
              class="input h-12 w-full px-3 py-2 mb-3 md:mb-0 mr-2 border rounded-xl"
              type="select"
              placeholder="First name"
              onChange={(event) => setFirstName(event.target.value)}
            />
            <input
              class="input h-12 w-full px-3 py-2 mb-3 border rounded-xl"
              type="text"
              placeholder="Last name"
              onChange={(event) => setLastName(event.target.value)}
            />
          </div>
          <label class="text-black block pl-2 text-xs font-extralight pb-1">
                Address of the clinic
          </label>
           <select
              class="input h-12 w-full px-3 py-2 mb-3  mr-2  border rounded-xl"
              onChange={(event) => setClinicCountry(event.target.value)}
            >
              <option value="none" selected disabled hidden>Select your Country</option>
              {
              allCountries.map((country) => (
                <option value={country.code}>{country.name}</option>
              ))
            }
          </select>
          <div class="flex flex-row">
            <input
              class="input h-12 w-full px-3 py-2 mb-3  mr-2  border rounded-xl"
              type="text"
              placeholder="City"
              onChange={(event) => setClinicCity(event.target.value)}
            />
            <input
              class="input h-12 w-full px-3 py-2 mb-3  border rounded-xl"
              type="text"
              placeholder="Street"
              onChange={(event) => setClinicStreet(event.target.value)}
            />
          </div>
          <div class="flex flex-row">
            <input
              class="input h-12 w-full px-3 py-2 mb-3  mr-2  border rounded-xl"
              type="text"
              placeholder="House number"
              onChange={(event) => setClinicHouseNumber(event.target.value)}
            />
            <input
              class="input h-12 w-full px-3 py-2 mb-3  border rounded-xl"
              type="text"
              placeholder="Zipcode"
              onChange={(event) => setClinicZipcode(event.target.value)}
            />
          </div>
          <label class="text-black block pl-2 text-xs font-extralight pb-1">
                Upload a profile image
          </label>
          <input
              class="input h-12 w-full px-3 py-2 mb-6  border rounded-xl"
              type="file"
              accept=".jpeg, .jpg, .png"
              placeholder="Upload a profile image"
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onChange={async () => {
                setPicture(await handleUpload())
              }}
            />

        {error() !== null && <p class="text-error">{error()}</p>}
        <button type="submit" class="log-in-btn h-12 mb-6 bg-secondary rounded-xl text-base" onclick={signUpWrapper} >
            Create account
            </button>
        <p class="font-extralight">Already have an account?
        <span class="font-medium">
        <A class='text-black' href="/"> Log in.</A>
            </span>
          </p>
        </div>
      </div>
    </>
}
