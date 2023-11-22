import { type JSX } from 'solid-js/jsx-runtime'
import Navbar from '../components/Navbar/Navbar'
import DentistCalendar from '../components/Calendar/Calendar'

export default function DentistSignup (): JSX.Element {
  return <>
      <div class="flex flex-col h-full w-full">
          <div class="">
              <Navbar/>
          </div>
          <div>
          <DentistCalendar/>
          </div>
      </div >
      </>
}
