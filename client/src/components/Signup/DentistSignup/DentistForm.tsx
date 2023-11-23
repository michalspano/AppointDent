import { type JSX } from 'solid-js/jsx-runtime'
import logo from '../../../assets/logo.png'
import { A } from '@solidjs/router'
import { createSignal } from 'solid-js'
import { Api } from '../../../utils/api'
import type { RegistrationData } from '../../../utils/types'

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

  const signUp = (): void => {
    const registrationData: RegistrationData = {
      email: email(),
      password: password(),
      firstName: firstName(),
      lastName: lastName(),
      clinicCountry: clinicCountry(),
      clinicCity: clinicCity(),
      clinicStreet: clinicStreet(),
      clinicHouseNumber: clinicHouseNumber(),
      clinicZipCode: clinicZipCode(),
      picture: picture()
    }
    if (Object.values(registrationData).some((field) => field === '')) {
      setError('Please fill in all fields.')
      return
    }
    Api
      .post('/dentists/register', registrationData)
      .then(async () => {
        // enable automatic login when user registers
        await login()
      })

      .catch((error: any) => {
        console.error('Error during sign up', error)
      })

    setError(null)
  }

  const login = async (): Promise<void> => {
    try {
      await Api.post('/dentists/login', { email: email(), password: password() })
      // navigate to logged in view
        .then(() => {
        // navigate to logged in view
          window.location.href = '/calendar' // calendar is a home page for the dentist
        })
    } catch (error) {
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
              type="text"
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
          <label class="block pl-2 text-xs font-extralight pb-1">
                Address of the clinic
          </label>
           <input
              class="input h-12 w-full px-3 py-2 mb-3  mr-2  border rounded-xl"
              type="text"
              placeholder="Country"
              onChange={(event) => setClinicCountry(event.target.value)}
            />
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
          <label class="block pl-2 text-xs font-extralight pb-1">
                Upload a profile image
          </label>
          <input
              class="input h-12 w-full px-3 py-2 mb-6  border rounded-xl"
              type="file"
              accept=".jpeg, .jpg, .png"
              placeholder="Upload a profile image"
              onChange={(event) => setPicture(event.target.value)}
            />

        {error() !== null && <p class="text-error">{error()}</p>}
        <button type="submit" class="log-in-btn h-12 mb-6 bg-secondary rounded-xl text-base" onclick={signUp} >
            Create account
            </button>
        <p class="font-extralight">Already have an account?
        <span class="font-medium">
        <A href="/"> Log in.</A>
            </span>
          </p>
        </div>
      </div>
    </>
}
