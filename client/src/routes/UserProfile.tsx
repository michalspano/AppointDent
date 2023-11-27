import { type JSX } from 'solid-js/jsx-runtime'
import { type Dentist, type Patient } from '../utils/types'
import PatientProfile from '../components/MyProfile/PatientProfile/PatientProfile'
import { Api } from '../utils/api'
import { Show, createEffect, createSignal } from 'solid-js'

export default function DentistProfilePage (): JSX.Element {
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

  /**
   * Get the current logged in user's email.
   * @returns Current user email (string)
   */
  async function getCurrentUser (): Promise<any> {
    const dentistResponse = await Api.get('sessions/whois', { withCredentials: true })
    return dentistResponse.data
  }

  async function getUser (): Promise<Patient | Dentist | undefined> {
    try {
      const currentUser = await getCurrentUser()
      const email: string = currentUser.email
      const type: string = currentUser.type

      if (type === 'd') {
        const { data } = await Api.get(`/dentists/${email}`, { withCredentials: true })
        return data
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
        </div>
      }
    >
      <div class="w-full h-full flex">
        <PatientProfile patientProp={patientUser()} />
      </div>
    </Show>
  )
}
