import { type JSX } from 'solid-js/jsx-runtime'
import LoginImage from '../components/LoginImage/LoginImage'
import PatientForm from '../components/Signup/PatientSignup/PatientForm'
import LoginNav from '../components/LoginNav/LoginNav'

export default function PatientSignup (): JSX.Element {
  return <>
      <div class="flex h-screen w-full">
          <div class="w-1/2 md:block hidden">
              <LoginImage/>
          </div>
          <div class="w-full lg:w-1/2 flex flex-col justify-center">
            <LoginNav/>
            <PatientForm/>
          </div>
      </div >
      </>
}
