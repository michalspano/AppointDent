import axios, { AxiosError } from 'axios'
import { type JSX } from 'solid-js/jsx-runtime'
import { type Dentist, type Patient } from '../utils/types'
import DentistProfile from '../components/MyProfile/DentistProfile/DentistProfile'
import PatientProfile from '../components/MyProfile/PatientProfile/PatientProfile'
// import LoginNav from '../components/LoginNav/LoginNav'
// import LoginImage from '../components/LoginImage/LoginImage'

async function getUser (): Promise<Patient | Dentist | undefined> {
  try {
    // I just assumed that email and probably session will be saved in
    // local storage and fetched to send a request to the server
    // you can change this method however yu see fit.
    let stringEmail = localStorage.getItem('userEmail')
    if (stringEmail !== null) {
      const dentistEmail = JSON.parse(stringEmail)
      stringEmail = dentistEmail.email
    }
    // this is just a dummy url. This will change under integration with
    // backend integration
    const url = `/dentist/${stringEmail}`
    // please refer to axios documentation for figuring out the types
    const { data } = await axios.get<Dentist>(url)
    return data
  } catch (err: any) {
    if (err instanceof AxiosError && err.response?.status === 404) {
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
  }
}

export default function DentistProfilePage (): JSX.Element {
  // actual user that is fetched from the backend.
  // changes are needed in the method getUser() to integrate with the server
  let user: Patient | Dentist | undefined
  getUser()
    .then(result => { user = result })
    .catch(err => { console.log(err) })
  // you can remove the console.log when integration with backend is finished.
  // it is just there to prevent ESLint error
  console.log(user)
  // dummy dentist
  const user2: Dentist = {
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

  // dummy patient
  const user3: Patient = {
    userEmail: 'omidkhoda2002@gmail.com',
    name: {
      firstName: 'Omid',
      lastName: 'Khodaparast'
    },
    dateOfBirth: new Date('2002/01/01')
  }

  // based on the type of the user the content rendered will be different
  // user2 needs to be exchanged with user during integration with backend
  // user2 is put here to check the style of the rendered content for both
  // patient and dentist
  // use user2 to check dentist profile
  // use user3 to check patient profile
  if (user3 !== null && user3 !== undefined) {
    if ('dateOfBirth' in user3) {
      return <>
        <div class='w-full h-full flex'>
          <PatientProfile patientProp={user3}/>
        </div>
      </>
    } else {
      return <>
        <div class='w-full h-full flex'>
          <DentistProfile dentistProp={user2}/>
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
