import { For, createSignal, createEffect, type JSX } from 'solid-js'
import Booking from './Booking'
import { type Appointment } from './types'
import { Api } from '../../utils/api'

export default function MyBookings (): JSX.Element {
  const [appointments, setAppointments] = createSignal<Appointment[]>([])

  createEffect(async () => {
    await fetchAppointments()
  })

  /**
 * Get a dentist from the dentist service based on their email
 * @param dentistId - Email of the dentist
 * @returns Dentist's address, first name and last name
 */
  const fetchDentist = async (dentistId: string): Promise<any> => {
    try {
      const dentistResponse = await Api.get(`dentists/${dentistId}`)
      const dentistData = dentistResponse.data[0]
      return {
        address: `${dentistData.clinicStreet} ${dentistData.clinicHouseNumber}, ${dentistData.clinicCity}`,
        firstName: dentistData.firstName,
        lastName: dentistData.lastName
      }
    } catch (error) {
      throw new Error('Error fetching dentist')
    }
  }

  /**
   * Get all appointments from a user
   */
  const fetchAppointments = async (): Promise<void> => {
    try {
      const response = await Api.get('appointments/patients/12312321') // Replace with the actual patient id
      const appointmentsData = response.data

      const formattedAppointments = await Promise.all(
        appointmentsData.map(async (appointment: any) => {
          const dentistInfo = await fetchDentist(appointment.dentistId)
          return {
            // Parse the integer format of a date into human readable date
            start_timestamp: new Date(appointment.start_timestamp * 1000).toLocaleString('sv-SE', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric'
            }),
            end_timestamp: new Date(appointment.end_timestamp * 1000).toLocaleString('sv-SE', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric'
            }),
            dentistId: appointment.dentistId,
            id: appointment.id,
            address: dentistInfo.address,
            dentistFirstName: dentistInfo.firstName,
            dentistLastName: dentistInfo.lastName
          }
        })
      )
      setAppointments(formattedAppointments)
    } catch (error) {
      throw new Error('Error fetching appointments')
    }
  }

  /**
   * Removes the selected appointment from the array of appointments.
   * @param id The id of the appointment being cancelled.
   */
  const handleCancelBooking = async (id: string): Promise<void> => {
    try {
      try {
        await Api.patch(`appointments/${id}?toBook=false`)
      } catch (err) {
        throw new Error(`Error cancelling appointment with ID ${id}`)
      }
      // If the cancellation is successful, update the local state.
      setAppointments((prevAppointments: Appointment[]) => {
        const foundIndex = prevAppointments.findIndex(appointment => appointment.id === id)
        if (foundIndex === -1) {
          console.error(`Appointment with ID ${id} not found.`)
          return prevAppointments
        }
        const newAppointments = [...prevAppointments]
        newAppointments.splice(foundIndex, 1)
        return newAppointments
      })
    } catch (err) {
      throw new Error(`Error cancelling appointment with ID ${id}`)
    }
  }

  return (
    <div class="h-full w-full flex flex-col justify-start items-center">
      <div class='w-full flex justify-start m-10'>
        <h1 class='text-2xl font-bold pl-10'>My bookings</h1>
      </div>
      <div class='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full'>
        <For each={appointments()}>{(appointment: Appointment) => (
          <Booking
          // pass in the appointment as props
            {...appointment}
            onCancel={() => {
              handleCancelBooking(appointment.id).catch((error) => {
                console.error('Error cancelling appointment:', error)
              })
            }}
          />
        )}</For>
      </div>
    </div>
  )
}
