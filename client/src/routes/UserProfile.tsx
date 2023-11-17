// import axios, { AxiosError } from 'axios'
import { type JSX } from 'solid-js/jsx-runtime'
import { type Dentist, type Patient } from '../utils/types'
import DentistProfile from '../components/MyProfile/DentistProfile/DentistProfile'
// import LoginNav from '../components/LoginNav/LoginNav'
// import LoginImage from '../components/LoginImage/LoginImage'

/* async function getUser (): Promise<Patient | Dentist | undefined> {
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
} */

export default function DentistProfilePage (): JSX.Element {
  // getUser()
  //   .then(result => { user = result })
  //   .catch(err => { console.log(err) })
  const user: Patient | Dentist | undefined = {
    userEmail: 'omidkhoda2002@gmail.com',
    name: {
      firstName: 'Omid',
      lastName: 'Khodaparast'
    },
    address: {
      street: 'Önskevädersgatan',
      city: 'Göteborg',
      zip: 23456,
      houseNumber: '12A',
      country: 'Sweden'
    },
    picture: 'Omid\'s picture'
  }
  if (user !== null && user !== undefined) {
    if ('dateOfBirth' in user) {
      return <>
      </>
    } else {
      return <>
        <div class='w-full h-full flex'>
          <DentistProfile dentistProp={user}/>
        </div>
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
