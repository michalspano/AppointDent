import { createSignal, type JSX, createEffect } from 'solid-js'
import dentist_img from '../../assets/dentist_img.jpeg'
import { Api } from '../../utils/api'
import type { Appointment } from '../../utils/types'
export default function AppointmentsList (): JSX.Element {
  createEffect(async () => {
    await fetchAppointments()
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setInterval(async () => {
      await fetchAppointments()
    }, 5000)
  })

  async function fetchAppointments (): Promise<void> {
    try {
      const response = await Api.get('/appointments/dentists/generic.doctor@clinit_name.se') // NB! replace with actual email
      const appointments = response.data
      const formattedAppointments = appointments.map((appointment: any) => ({
        id: appointment.id,
        title: appointment.patientId !== null ? appointment.patientId : '', // add filter only unbooked appointments
        start: new Date(appointment.start_timestamp * 1000).toISOString().slice(0, 16),
        end: new Date(appointment.end_timestamp * 1000).toISOString().slice(0, 16)
      }))

      const groupedAppointments = formattedAppointments.reduce((acc: any, appointment: any) => {
        const day = appointment.start.slice(0, 10)
        if (acc[day] === undefined) {
          acc[day] = []
        }
        acc[day].push(appointment)
        return acc
      }, {})
      const groupedAppointmentsArray = Object.entries(groupedAppointments).map(([day, appointments]) => ({
        day,
        appointments
      }))
      groupedAppointmentsArray.sort((a, b) => (a.day > b.day ? 1 : -1))
      setAvailableDays(groupedAppointmentsArray)
    } catch (error) {
      throw new Error('Error fetching appointments')
    }
  }

  interface GroupedAppointments {
    day: string
    appointments: unknown
  }

  const [availableDays, setAvailableDays] = createSignal<GroupedAppointments[]>([])
  const [availableTime, setAvailableTime] = createSignal<Appointment[]>([])
  const [selectedDate, setSelectedDate] = createSignal<string | null>(null)
  const [selectedTime, setSelectedTime] = createSignal<Appointment | null>(null)

  const formatDate = (date: string): string => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
    return new Date(date).toLocaleDateString(undefined, options)
  }

  const formatTime = (date: string): string => {
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
    return new Date(date).toLocaleTimeString([], options)
  }

  const onDateSelect = (appointment: any): void => {
    setSelectedDate(appointment.day)
    const availableDaysData = availableDays()
    const isMatchingDay = (entry: { day: any }): boolean => entry.day === appointment.day
    const selectedDayData = availableDaysData.find(isMatchingDay)
    if (selectedDayData !== undefined) {
      setAvailableTime(selectedDayData.appointments as Appointment[])
    }
  }
  const onTimeSelect = (timeSlot: any): void => {
    setSelectedTime(timeSlot)
  }

  const onBookAppointment = (): void => {
    if ((selectedDate() != null) && (selectedTime() != null)) {
      const bookedAppointment = {
        date: selectedDate(),
        timeSlot: selectedTime()
      }
      console.log('Booked Appointment:', bookedAppointment) // connect to BE
    } else {
      console.error('Please select a date and time slot before booking.')
    }
  }

  return (
      <div class="h-full w-full flex flex-col justify-start items-start overflow-hidden">
        <div class='w-full flex justify-start m-10'>
          <h1 class='text-2xl font-bold pl-10'>Available Slots</h1>
        </div>
        <div class='flex flex-col lg:flex-row justify-start m-6 ml-48'>
          <div class='flex-col justify-start'>
            <img class='rounded-lg' src={dentist_img} alt="Dentist picture" />
            <div class='flex-col text-center mt-4 text-lg'>
              <h1 class='font-semibold'>Doctor John Doe</h1>
              <h1 class='mt-2 font-semibold'>Location: Linnegatan 15</h1>
            </div>
          </div>
          <div>
            <div class="m-6 ml-20 mt-0">
              <h3 class='desc text-xl text-slate-500'>Please, select the preferred date and time to schedule your appointment.</h3>
              <h3 class='text-lg mt-10 font-medium'>Select Date</h3>
              <div class='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-15 w-full'>
                {availableDays().slice(0, 5).map((appointment) => (
                <div class={`flex w-35 m-4 h-20 w-32 rounded-lg cursor-pointer font-semibold items-center justify-center ${selectedDate() === appointment.day ? 'bg-primary' : 'bg-grey'}`} onClick={() => { onDateSelect(appointment) }}>
                  {formatDate(appointment.day)}
                </div>
                ))}
              </div>
              {(selectedDate() != null) && (
              <div>
                <h3 class='text-lg mt-6 font-medium'>Select Time</h3>
                {availableTime().length > 0
                  ? <ul class="flex flex-row w-full">
                  {availableTime().map((appointment: Appointment) => (
                  <div class={`flex cursor-pointer w-35 m-4 h-20 w-32 rounded-lg cursor-pointer font-semibold items-center justify-center ${selectedTime() === appointment ? 'text-white bg-primary' : 'bg-grey'}`} onClick={() => { onTimeSelect(appointment) }}>
                    {formatTime(appointment.start)} - {formatTime(appointment.end)}
                  </div>
                  ))}
                </ul>
                  : <p>No available time slots for the selected date.</p>}
              </div>
              )}
              {(selectedDate() != null) && (selectedTime() != null) && (
              <button class='bg-secondary rounded-lg text-white p-4 mr-3 mt-6 ml-4 text-black px-8' onClick={onBookAppointment}>
                Book Appointment
              </button>
              )}
            </div>
          </div>
        </div>
      </div>
  )
}
