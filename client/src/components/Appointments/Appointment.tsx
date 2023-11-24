import { type JSX } from 'solid-js'
import './Appointment.css'
import { type Appointment } from './types'

interface AppointmentProps extends Appointment {
  onCancel: () => void
}

export default function AppointmentItem (props: AppointmentProps): JSX.Element {
  return (
    <div class='w-full flex flex-row items-center justify-center'>
      <div class="flex flex-col items-center bg-primary rounded-lg">
        <div class='details flex flex-col items-center p-8'>
          <p class='details mb-2'>Date: {props.date}</p>
          <p class='details'>Time: {props.time}</p>
          <button class="delete-btn mt-5 px-4 text-white py-2 rounded-xl" style="background-color: rgba(39, 94, 97, 1);" onClick={props.onCancel}>Book</button>
        </div>
      </div>
    </div>
  )
}
