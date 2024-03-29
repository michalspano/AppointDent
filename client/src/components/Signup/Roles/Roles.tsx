import { type JSX } from 'solid-js/jsx-runtime'
import { A, Link } from '@solidjs/router'
import logo from '../../../assets/logo.png'
import dentistrole from '../../../assets/dentist-role.png'
import patientrole from '../../../assets/patient-role.png'
import arrow from '../../../assets/arrow-right.png'
import './Roles.css'

export default function Roles (): JSX.Element {
  return <>
  <div class="h-full w-full bg-white flex flex-col items-center justify-center">
  <div class="lg:w-3/4 w-5/6 flex flex-col text-black rounded-sm bg-gradient-to-b from-neutral ... md:px-10 px-4 py-10 text-sm font-medium">
            <div class="flex items-center justify-center">
            <img class="w-40 " src={logo} alt="AppointDent" />
            </div>
            <h1 class="mb-4 mt-10 text-lg">Sign up to AppointDent</h1>
            <p class="mb-10 font-extralight">To create an account, please choose your role.</p>
            <div class="flex flex-row justify-evenly">
            <Link href="/dentist-signup">
              <div class="role-card flex flex-col justify-center items-center p-3 rounded-2xl mr-3 cursor-pointer">
                <img class="w-full h-auto p-1" src={dentistrole} alt="Dentist" />
                <div class="w-full flex flex-row justify-evenly">
                  <p class="flex align-center">Dentist</p>
                  <img class="w-5" src={arrow} alt="Arrow right" />
                </div>
              </div>
            </Link>
            <Link href="/patient-signup">
            <div class="role-card flex flex-col justify-center items-center p-3 rounded-2xl shadow-xl cursor-pointer ">
              <img class="w-full h-auto p-1" src={patientrole} alt="Patient" />
              <div class="w-full flex flex-row justify-evenly">
                <p class="flex align-center">Patient</p>
              <img class="w-5" src={arrow} alt="Arrow right" />
              </div>
            </div>
            </Link>
           </div>
        <p class="font-extralight mt-10">Already have an account?
        <span class="font-medium">
        <A class='text-black' href="/"> Log in.</A>
            </span>
          </p>
        </div>
      </div>
    </>
}
