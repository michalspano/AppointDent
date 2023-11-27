import LoginImage from '../../../assets/home.png'
import logo from '../../../assets/logo.png'
import { type Patient } from '../../../utils/types'
import { createStore } from 'solid-js/store'
import { createSignal, type JSX } from 'solid-js'
import axios from 'axios'
import { type AxiosResponse } from 'axios'
import { type PatientProfileProps } from '../MyProfileTypes'
import { isValidPatient } from '../utils'
import CustomInput from '../CustomInput'

export default function DentistProfile (patientProp: PatientProfileProps): JSX.Element {
  // we need a copy, so that the original values do not change
  // in case a wrong patch is executed, we set the values back to what
  // they were
  const patientCopy = structuredClone(patientProp.patientProp)
  const [patient, setPatient] = createStore<Patient>(patientCopy)
  const [getError, setError] = createSignal<Error | null>(null)

  // The following method will be called upon saving changes
  // You can change it however you see fit when you are integrating with the
  // backend
  const patchPatient = function patchPatient (patchedPatient: Patient): void {
    const validPatient = isValidPatient(patient)
    if (validPatient !== undefined) {
      setError(new Error(validPatient))
      setTimeout(() => setError(null), 2000)
      return
    }
    const url = `/patient/${patchedPatient.userEmail}`
    axios.patch<Patient, AxiosResponse<Patient>, Patient>(url, patchedPatient)
      .then(result => { setPatient(result.data) })
      .catch(err => {
        setPatient(patientProp.patientProp)
        setError(new Error('Please try again.'))
        setTimeout(() => {
          setError(null)
          setPatient(patientProp.patientProp)
          location.reload()
        }, 3000)
        console.log(err)
      })
  }

  return <>
    <div class="h-auto w-screen bg-white flex lg:flex-row flex-col items-center justify-center">
      <div class='lg:h-full lg:w-1/2 w-full h-1/8 flex flex-col bg-primary justify-center'>
        <div class='lg:flex h-5/6 flex-col items-center justify-start hidden '>
          <img class='lg:w-5/6 w-1/5 h-auto lg:rounded-sm rounded-full' src={LoginImage} alt='profile image' />
        </div>
      </div>
      <div class="lg:w-1/2 w-5/6 h-screen m-8 flex flex-col text-black rounded-sm lg:justify-start justify-start bg-gradient-to-b from-neutral ... lg:px-10 px-5 py-20 text-sm font-medium">
        <div class="flex flex-col items-center justify-center">
          <img class="w-40 " src={logo} alt="AppointDent" />
        </div>
          <h1 class="mb-2 mt-4 text-lg">{patient.name.firstName}'s Profile</h1>
          <label class='text-black'>Email</label>
          <div>
                      <CustomInput value={patient.userEmail} inputType='text' onChange={(event) => { setPatient('userEmail', event.target.value) }} disabled={true}/>
          </div>
          <div class="flex flex-row justify-between w-full">
            <div class='flex flex-col w-full mr-2'>
              <label class='text-black'>First name</label>
            <CustomInput class='mr-2' value={patient.name.firstName} inputType='text' onChange={(event) => { setPatient('name', 'firstName', event.target.value) }} disabled={false}/>
            </div>
            <div class='flex flex-col w-full '>
               <label class='text-black'>Last name</label>
            <CustomInput value={patient.name.lastName} inputType='text' onChange={(event) => { setPatient('name', 'lastName', event.target.value) }} disabled={false}/>
            </div>
          </div>
          <label class='text-black'>Date of birth</label>
          <div>
              <CustomInput class='' max={new Date().toISOString().split('T')[0]} value={patient.dateOfBirth.toISOString().split('T')[0]} inputType='date' onChange={(event) => { setPatient('dateOfBirth', new Date(event.target.value)) }} disabled={true}/>
          </div>
          {getError() !== null ? <p class="text-error">{(getError() as Error).message}</p> : <></>}
          <button type="submit" class="p-4 bg-secondary rounded-xl text-base" onClick={() => { patchPatient(patient) }}>
             Save changes
          </button>
      </div>
    </div>
  </>
}
