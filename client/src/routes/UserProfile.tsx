import { type JSX } from 'solid-js/jsx-runtime'
import { type Dentist, type Patient } from '../utils/types'
import PatientProfile from '../components/MyProfile/PatientProfile/PatientProfile'
import { Api } from '../utils/api'
import { Show, createEffect, createSignal } from 'solid-js'
import DentistProfile from '../components/MyProfile/DentistProfile/DentistProfile'

export default function UserProfile (): JSX.Element {
  createEffect(async () => {
    await getUser()
  })
  const [isPatient, setIsPatient] = createSignal(false)
  const [patientUser, setPatientUser] = createSignal<Patient>({
    email: '',
    firstName: '',
    lastName: '',
    birthDate: 0
  })
  const [dentistUser, setDentistUser] = createSignal<Dentist>({
    email: '',
    firstName: '',
    lastName: '',
    clinicStreet: '',
    clinicCity: '',
    clinicZipCode: 0,
    clinicHouseNumber: 0,
    clinicCountry: '',
    picture: ''
  })

  /**
   * Get the current logged in user's email.
   * @returns Current user email (string)
   */
  async function getCurrentUser (): Promise<any> {
    const dentistResponse = await Api.get('sessions/whois', { withCredentials: true })
    return dentistResponse.data
  }

  async function getUser (): Promise<void> {
    try {
      const currentUser = await getCurrentUser()
      const email: string = currentUser.email
      const type: string = currentUser.type

      if (type === 'd') {
        setIsPatient(false)
        const { data } = await Api.get(`/dentists/${email}`, { withCredentials: true })
        const user: Dentist | undefined = Array.isArray(data) && data.length > 0
          ? (data[0] as Dentist)
          : undefined

        if (user !== undefined) {
          setDentistUser({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            clinicStreet: user.clinicStreet,
            clinicCity: user.clinicCity,
            clinicZipCode: user.clinicZipCode,
            clinicHouseNumber: user.clinicHouseNumber,
            clinicCountry: user.clinicCountry,
            picture: user.picture
          })
        }
      }

      if (type === 'p') {
        setIsPatient(true)
        const { data } = await Api.get(`/patients/${email}`, { withCredentials: true })
        const user: Patient | undefined = Array.isArray(data) && data.length > 0
          ? (data[0] as Patient)
          : undefined

        if (user !== undefined) {
          setPatientUser({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            birthDate: user.birthDate
          })
        }
      }
    } catch (error: any) {
      console.log(error)
    }
  }

  return (
    <Show
      when={isPatient()}
      fallback={
        <div class="w-full h-full flex">
          <DentistProfile dentistProp={dentistUser()} />
        </div>
      }
    >
      <div class="w-full h-full flex">
        <PatientProfile patientProp={patientUser()} />
      </div>
    </Show>
  )
}
