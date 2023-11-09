import { type JSX } from 'solid-js/jsx-runtime'
import LoginImage from '../components/LoginImage/LoginImage'
import DentistForm from '../components/Signup/DentistSignup/DentistForm'
import LoginNav from '../components/LoginNav/LoginNav'

export default function DentistSignup (): JSX.Element {
  return <>
      <div class="flex h-screen w-full">
          <div class="w-1/2 md:block hidden">
              <LoginImage/>
          </div>
          <div class="w-full lg:w-1/2 flex flex-col">
        <div class="pb-5">
          <LoginNav />
        </div>
        <div>
          <DentistForm />
        </div>
      </div>
      </div >
      </>
}
