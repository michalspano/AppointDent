import axios, { AxiosError } from 'axios'
import { type JSX } from 'solid-js/jsx-runtime'
import { type Dentist, type Patient } from '../utils/types'
import DentistProfile from '../components/MyProfile/DentistProfile/DentistProfile'
// import LoginNav from '../components/LoginNav/LoginNav'
// import LoginImage from '../components/LoginImage/LoginImage'

async function getUser (): Promise<Patient | Dentist | undefined> {
  try {
    let stringEmail = localStorage.getItem('userEmail')
    if (stringEmail !== null) {
      const dentistEmail = JSON.parse(stringEmail)
      stringEmail = dentistEmail.email
    }
    const url = `/dentist/${stringEmail}`
    const { data } = await axios.get<Dentist>(url)
    return data
  } catch (err: any) {
    if (err instanceof AxiosError) {
      if (err.response?.status === 404) {
        try {
          let stringEmail = localStorage.getItem('userEmail')
          if (stringEmail !== null) {
            const dentistEmail = JSON.parse(stringEmail)
            stringEmail = dentistEmail.email
          }
          const url = `/patient/${stringEmail}`
          const { data } = await axios.get<Patient>(url)
          return data
        } catch (error: any) {
          console.log(error)
        }
      } else {
        console.log(err)
      }
    } else {
      console.log(err)
    }
  }
}

export default async function DentistProfilePage (): Promise<JSX.Element> {
  const user = await getUser()
  if (user !== null && user !== undefined) {
    if ('dateOfBirth' in user) {
      return <>
      </>
    } else {
      return <>
        <DentistProfile dentistProp={user}/>
      </>
    }
  } else {
    return <>
      <div>
        <p>
          Something went wrong
        </p>
      </div>
    </>
  }
}
