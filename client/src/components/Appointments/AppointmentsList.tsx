import { createSignal, type JSX, createEffect, onCleanup } from 'solid-js'
import dentist_img from '../../assets/dentist_img.jpeg'
import { Api } from '../../utils/api'
import type { Appointment } from '../../utils/types'
import BookingConfirmationPopup from './BookingConfirmation'
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
      const response = await Api.get('/appointments/dentists/generic.doctor@clinit_name.se?onlyAvailable=true') // TODO: replace with actual email when BE supports it
      const appointments = response.data
      const formattedAppointments = appointments.map((appointment: any) => ({
        id: appointment.id,
        title: appointment.patientId !== null ? appointment.patientId : '',
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

  async function bookAppointment (appointment: Appointment): Promise<void> {
    console.log(appointment)
    const appointmentId = appointment.id
    try {
      await Api.patch(`/appointments/${appointmentId}?toBook=true`, { patientId: '12312321' }).then(() => { // TODO: replace with real patientId when BE supports it
        console.log('Appointment created successfully')
      })
    } catch (error) {
      throw new Error('Error creating appointment')
    }
  }

  interface GroupedAppointments {
    day: string
    appointments: unknown
  }

  const [availableDays, setAvailableDays] = createSignal<GroupedAppointments[]>([])
  const [availableTime, setAvailableTime] = createSignal<Appointment[]>([])
  const [selectedDate, setSelectedDate] = createSignal<string>('')
  const [selectedTime, setSelectedTime] = createSignal<string>('')
  const [showConfirmation, setShowConfirmation] = createSignal<boolean>(false)
  const [selectedAppointment, setSelectedAppointment] = createSignal<Appointment | null>(null)

  const formatDate = (date: string): string => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
    return new Date(date).toLocaleDateString(undefined, options)
  }

  const formatTime = (date: string): string => {
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
    return new Date(date).toLocaleTimeString([], options)
  }

  const formatTimeEntry = (appointment: any): string => {
    return `${formatTime(appointment.start)} - ${formatTime(appointment.end)}`
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
  const onTimeSelect = (appointment: any): void => {
    setSelectedAppointment(appointment)
    const selectedTime = formatTimeEntry(appointment)
    setSelectedTime(selectedTime)
  }

  const onBookAppointment = (): void => {
    if ((selectedDate() != null) && (selectedTime() != null)) {
      setShowConfirmation(true)
    } else {
      console.error('Please select a date and time slot before booking.')
    }
  }
  onCleanup(() => {})

  const dentist = 'Doctor Ann Smith' // receive as props when navigating from map
  const location = 'Linnégatan 15'

  return (
      <div class="h-full w-full flex flex-col justify-center items-center lg:justify-start lg:items-start overflow-hidden">
        <div class='w-full flex justify-start m-10'>
          <h1 class='text-2xl font-bold pl-10'>Available Slots</h1>
        </div>
        <div class='flex flex-col lg:flex-row justify-start m-6 lg:ml-20 lg:ml-40'>
          <div class='flex flex-col justify-start sm:items-center'>
            <img class='rounded-lg lg:w-full sm:w-6/12' src={dentist_img} alt="Dentist picture" />
            <div class='flex-col text-center mt-4 text-lg'>
              <h1 class='font-semibold'>{dentist}</h1>
              <h1 class='mt-2'>Location: <strong>{location}</strong></h1>
            </div>
          </div>
          <div>
            <div class="m-6 lg:ml-20 mt-0">
              <h3 class='desc text-xl text-slate-500 xs:mt-8 md:mt-0 font-semibold'>Please, select your preferred date and time to schedule your appointment.</h3>
              <h3 class='text-lg mt-10 font-medium'>Select Date</h3>
              <div class='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-15 w-full'>
                {availableDays().slice(0, 5).map((appointment) => (
                <div class={`flex w-35 m-4 h-20 rounded-lg cursor-pointer font-semibold items-center justify-center ${selectedDate() === appointment.day ? 'bg-primary text-white' : 'bg-grey'}`} onClick={() => { onDateSelect(appointment) }}>
                  {formatDate(appointment.day)}
                </div>
                ))}
              </div>
              {(selectedDate() !== '') && (
              <div class='w-full'>
                <h3 class='text-lg mt-6 font-medium'>Select Time</h3>
                {availableTime().length > 0
                  ? <div class="grid grid-cols-3 xs:grid-cols-1 s:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-15 w-11/12">
                  {availableTime().map((appointment: Appointment) => (
                  <div class={`flex w-35 m-4 h-20 w-38 rounded-lg cursor-pointer font-semibold items-center justify-center ${selectedAppointment() === appointment ? 'bg-primary text-white' : 'bg-grey'}`} onClick={() => { onTimeSelect(appointment) }}>
                    {formatTimeEntry(appointment)}
                  </div>
                  ))}
                </div>
                  : <p>No available time slots for the selected date.</p>}
              </div>
              )}
              {(selectedDate() !== '') && (selectedTime() !== '') && (
              <button class='bg-primary rounded-lg text-white p-4 mr-3 mt-6 ml-4 text-black px-8' onClick={onBookAppointment}>
                Book Appointment
              </button>
              )}
            </div>
          </div>
        </div>
        {showConfirmation() && (
          <BookingConfirmationPopup
          onConfirm={() => {
            const appointment = selectedAppointment()
            if (appointment !== null) {
              bookAppointment(appointment).then(() => {
                setShowConfirmation(false)
                setSelectedDate('')
                setSelectedTime('')
                setSelectedAppointment(null)
              }).catch((error: any) => {
                console.error('Error deleting appointment:', error)
              })
            }
          }}
          onCancel={() => {
            setShowConfirmation(false)
          }}
          dentist={dentist}
          location={location}
          date={`${formatDate(selectedDate())} at ${formatTimeEntry(selectedAppointment())}`}
        />
        )}

      </div>
  )
}
