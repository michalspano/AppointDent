import LoginImage from '../../../assets/home.png'
import logo from '../../../assets/logo.png'
import { type Patient } from '../../../utils/types'
import { createStore } from 'solid-js/store'
import { createEffect, createSignal, type JSX } from 'solid-js'
import { type AxiosResponse } from 'axios'
import { type PatientProfileProps } from '../MyProfileTypes'
import { isValidName } from '../utils'
import CustomInput from '../CustomInput'
import { Api } from '../../../utils/api'

export default function PatientProfile (patientProp: PatientProfileProps): JSX.Element {
  const [patient, setPatient] = createStore<Patient>(patientProp.patientProp)
  const [getError, setError] = createSignal<Error | null>(null)

  createEffect(async () => {
    setPatient(patientProp.patientProp)
  })

  const patchPatient = async function patchPatient (patchedPatient: Patient): Promise<void> {
    const validPatient = isValidName(patchedPatient.firstName, patchedPatient.lastName)
    // if false is returned, the name is not valid
    if (!validPatient) {
      setError(new Error('First name and last name cannot be empty.'))
      setTimeout(() => setError(null), 2000)
      return
    }
    const url = `/patients/${patientProp.patientProp.email}`
    await Api.patch<Patient, AxiosResponse<Patient>, Patient>(url, patchedPatient, { withCredentials: true })
      .then(result => {
        const user = result.data
        if (user !== undefined) {
          setPatient(user)
        }
      })
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
          <h1 class="mb-2 mt-4 text-lg">{patientProp.patientProp.firstName}'s Profile</h1>
          <label class='text-black'>Email</label>
          <div>
          <CustomInput value={patientProp.patientProp.email} inputType='text' onChange={(event) => { setPatient('email', event.target.value) }} disabled={true}/>
          </div>
          <div class="flex flex-row justify-between w-full">
            <div class='flex flex-col w-full mr-2'>
              <label class='text-black'>First name</label>
            <CustomInput class='mr-2' value={patientProp.patientProp.firstName} inputType='text' onChange={(event) => { setPatient('firstName', event.target.value) }} disabled={false}/>
            </div>
            <div class='flex flex-col w-full '>
               <label class='text-black'>Last name</label>
            <CustomInput value={patientProp.patientProp.lastName} inputType='text' onChange={(event) => { setPatient('lastName', event.target.value) }} disabled={false}/>
            </div>
          </div>
          <label class='text-black'>Date of birth</label>
          <div>
              <CustomInput class='' max={new Date().toISOString().split('T')[0]} value={patientProp.patientProp.birthDate !== undefined ? new Date(patientProp.patientProp.birthDate).toISOString().split('T')[0] : ''} inputType='date' onChange={(event) => { setPatient('birthDate', Date.parse(new Date(event.target.value).toISOString())) }} disabled={true}/>
          </div>
          {getError() !== null ? <p class="text-error">{(getError() as Error).message}</p> : <></>}
          <button type="submit" class="p-4 bg-secondary rounded-xl text-base" onClick={() => { void patchPatient(patient) }}>
             Save changes
          </button>
      </div>
    </div>
  </>
}
