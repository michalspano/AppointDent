import { type JSX } from 'solid-js'
import './Booking.css'
import location from '../../assets/location.png'
import { type Appointment } from './types'

interface BookingProps extends Appointment {
  onCancel: () => void
}

export default function Booking (props: BookingProps): JSX.Element {
  return (
    <div class='w-full flex flex-row items-center justify-center'>
      <div class="flex flex-col items-center bg-primary rounded-lg w-5/6">
        <div class='details flex flex-col items-center p-8'>
          <p class='details mb-2'>{props.start_timestamp} - {props.end_timestamp}</p>
          <div class="mb-2 border-white border-y w-full"></div>
          <p class='details'>{props.dentistId}</p>
          <div class='flex flex-row justify-center items-center'>
            <img class='w-5 h-auto mr-2' src={location} alt="Location icon" />
            <p class='details'>location</p>
          </div>
          <button class="delete-btn mt-5 px-4 text-white py-2 bg-error rounded-xl" onClick={props.onCancel}>Cancel booking</button>
        </div>
      </div>
    </div>
  )
}
