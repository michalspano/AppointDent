import { For, createSignal, onCleanup, type JSX, createEffect } from 'solid-js'
import dentist_img from '../../assets/dentist_img.jpeg'
import { Api } from '../../utils/api'
export default function AppointmentList (): JSX.Element {
  createEffect(async () => {
    await fetchAppointments()
  })

  async function fetchAppointments (): Promise<void> {
    try {
      const response = await Api.get('/appointments/dentists/generic.doctor@clinit_name.se') // NB! replace with actual email
      const appointments = response.data
      const formattedAppointments = appointments.map((appointment: any) => ({
        id: appointment.id,
        title: appointment.patientId !== null ? appointment.patientId : '', // filter only unbooked appointments
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

      console.log(groupedAppointmentsArray)

      setAvailableDaySlots(groupedAppointmentsArray)
    } catch (error) {
      throw new Error('Error fetching appointments')
    }
  }

  const [availableDaySlots, setAvailableDaySlots] = createSignal([])
  const [availableTimeSlots, setAvailableTimeSlots] = createSignal([])
  const [selectedDate, setSelectedDate] = createSignal<number | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = createSignal<number | null>(null)

  const formatDate = (date: number): string => {
    const options = { day: 'numeric', month: 'short' }
    return new Date(date).toLocaleDateString([], options)
  }

  const formatTime = (date: number): string => {
    const options = { hour: '2-digit', minute: '2-digit' }
    return new Date(date).toLocaleTimeString([], options)
  }

  const handleDateSelect = (date: any): void => {
    setSelectedDate(date)
    const selectedAppointments = availableDaySlots().filter((appointment) => {
      const startTimestamp = appointment.start
      const endTimestamp = appointment.end

      return startTimestamp <= selectedDate() && selectedDate() <= endTimestamp
    })

    setAvailableTimeSlots(selectedAppointments)
  }
  const handleTimeSlotSelect = (timeSlot: any): void => {
    setSelectedTimeSlot(timeSlot)
  }

  const handleBookAppointment = (): void => {
    if ((selectedDate() != null) && (selectedTimeSlot() != null)) {
      const bookedAppointmentInfo = {
        date: selectedDate(),
        timeSlot: selectedTimeSlot()
      }
      console.log('Booked Appointment:', bookedAppointmentInfo)
    } else {
      console.error('Please select a date and time slot before booking.')
    }
  }

  return (
      <div class="h-full w-full flex flex-col justify-start items-center">
        <div class='w-full flex justify-start m-10'>
          <h1 class='text-2xl font-bold pl-10'>Available Slots</h1>
          <div class='h-5/6 w-5/6' id='slots'></div>
        </div>
        <div class='flex flex-row items-center m-6'>
          <div class='flex-col w-full items-center'>
            <img class='rounded-lg' src={dentist_img} alt="Dentist picture" />
            <div class='flex-col text-center mt-4 text-lg'>
              <h1>Doctor John Doe</h1>
              <h1 class='mt-2'>Location: Linnegatan 15</h1>
            </div>
          </div>
          <div>
            <div class="m-6">
              <h3 class='text-lg mt-10'>Please, select date and time to book the appointment</h3>
              <h3 class='text-lg mt-10'>Select Date</h3>
              <div class='flex flex-row w-full'>
                {availableDaySlots().map((slot) => (
                <div class={`flex w-35 m-4 h-20 w-32 rounded cursor-pointer items-center justify-center ${selectedDate() === slot.start ? 'text-white bg-primary' : 'bg-grey'}`} onClick={() => { handleDateSelect(slot.start) }}>
                  {formatDate(slot.start)}
                </div>
                ))}
              </div>
              {(selectedDate() != null) && (
              <div>
                <h3 class='text-lg mt-10'>Select Time on {formatDate(selectedDate())}</h3>
                {availableTimeSlots().length > 0
                  ? <ul class="flex flex-row w-full">
                  {availableTimeSlots().map((appointment) => (
                  <div class={`flex cursor-pointer w-35 m-4 h-20 w-32 rounded cursor-pointer items-center justify-center ${selectedTimeSlot() === appointment ? 'text-white bg-primary' : 'bg-grey'}`} onClick={() => { handleTimeSlotSelect(appointment) }}>
                    {formatTime(appointment.start)} - {formatTime(appointment.end)}
                  </div>
                  ))}
                </ul>
                  : <p>No available time slots for the selected date.</p>}
              </div>
              )}
              {(selectedDate() != null) && (selectedTimeSlot() != null) && (
              <button class='bg-secondary rounded text-white p-2 mr-3 text-black' onClick={handleBookAppointment}>
                Book Appointment
              </button>
              )}
            </div>
          </div>
        </div>
      </div>
  )
}
