// import { type JSX } from 'solid-js/jsx-runtime'
import logo from '../../../assets/logo.png'
import { type Patient } from '../../../utils/types'
import { createStore } from 'solid-js/store'
import { createSignal, type JSX } from 'solid-js'
import Navbar from '../../Navbar/Navbar'
import axios from 'axios'
import { type AxiosResponse } from 'axios'

interface PatientProfileProps {
  patientProp: Patient
}

function isValidDentist (patient: Patient): boolean {
  // RegEx expression to check email validity
  // source: https://www.tutorialspoint.com/how-to-validate-email-address-using-regexp-in-javascript
  if (patient.userEmail.match(/^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/) == null) {
    console.log(false)
    return false
  }
  if (patient.name.firstName === '' || patient.name.lastName === '') {
    console.log(false)
    return false
  }
  return true
}

export default function DentistProfile (patientProp: PatientProfileProps): JSX.Element {
  const [patient, setPatient] = createStore<Patient>(patientProp.patientProp)
  const [getError, setError] = createSignal<Error | null>(null)
  const patchPatient = function patchPatient (patchedPatient: Patient): void {
    if (!isValidDentist(patient)) {
      setError(new Error('Please provide valid credentials'))
    }
    const url = `/patient/${patchedPatient.userEmail}`
    axios.patch<Patient, AxiosResponse<Patient>, Patient>(url, patchedPatient)
      .then(result => { setPatient(result.data) })
      .catch(err => {
        setPatient(patientProp.patientProp)
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
          <img class='lg:w-5/6 w-1/5 h-auto lg:rounded-sm rounded-full' src={logo} alt='profile image' />
        </div>
      </div>
      <div class="lg:w-1/2 w-5/6 h-screen flex flex-col text-black rounded-sm bg-gradient-to-b from-neutral ... lg:px-10 px-5 py-3 text-sm font-medium">
        <div class="flex flex-col items-center justify-center">
          <img class="w-40 " src={logo} alt="AppointDent" />
        </div>
          <h1 class="mb-2 mt-4 text-lg">{patient.name.firstName}'s Profile</h1>
          <input
          class="input h-12 px-3 py-2 mb-3 border rounded-xl"
          type="text"
          placeholder={patient.userEmail}
          onChange={(event) => { setPatient('userEmail', event.target.value) }}
          />
          <div class="flex flex-row">
            <input
              class="input h-12 w-full px-3 py-2 mb-3 md:mb-0 mr-2 border rounded-xl"
              type="text"
              placeholder={patient.name.firstName}
              onChange={(event) => { setPatient('name', 'firstName', event.target.value) }}
            />
            <input
              class="input h-12 w-full px-3 py-2 mb-3 border rounded-xl"
              type="text"
              placeholder={patient.name.lastName}
              onChange={(event) => { setPatient('name', 'lastName', event.target.value) }}
            />
          <input
              class="input h-12 w-full px-3 py-2 mb-6 border rounded-xl"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              placeholder="Date of birth"
              onChange={(event) => { setPatient('dateOfBirth', new Date(event.target.value)) }}
            />
          {getError() !== null ? <p class="text-error">{(getError() as Error).message}</p> : <></>}
          <button type="submit" class="log-in-btn h-12 mb-6 bg-secondary rounded-xl text-base" onClick={() => { patchPatient(patient) }}>
             Save changes
          </button>
        </div>
      </div>
    </div>
  </>
}
