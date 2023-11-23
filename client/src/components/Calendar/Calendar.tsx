import { type JSX } from 'solid-js/jsx-runtime'
import { onCleanup, createEffect, createSignal } from 'solid-js'
import { Calendar } from '@fullcalendar/core'
import timeGridPlugin from '@fullcalendar/timegrid'
import './Calendar.css'
import { type Appointment } from '../../utils/types'
import { type EventContentArg, type EventClickArg } from '@fullcalendar/core'
import ConfirmationPopup from './DeleteConfirmation'
import { Api } from '../../utils/api'

export default function DentistCalendar (): JSX.Element {
  const [showForm, setShowForm] = createSignal<boolean>(false)
  const [showConfirmation, setShowConfirmation] = createSignal<boolean>(false)
  const [selectedEventId, setSelectedEventId] = createSignal<string | null>(null)
  const [slots, setSlots] = createSignal<Appointment[]>([]) // Use state to hold appointments
  const calendarRef: { current: Calendar | null } = { current: null }

  // Temporary array of appointment, will be modified once integrated with backend.

  const [newAppointment, setNewAppointment] = createSignal<Appointment>({
    id: '',
    title: '',
    start: '',
    end: ''
  })

  async function handleFormSubmit (e: any): Promise<void> {
    e.preventDefault()
    try {
      await addAppointment(newAppointment())
    } catch (error) {
      console.error('Error adding appointment:', error)
      // Handle the error, show a message to the user, etc.
    }
  }

  function parseDateStringToInteger (dateString: string): number {
    // Parse the date string into a Date object
    const date = new Date(dateString)
    // Get the timestamp in milliseconds
    const timestamp = date.getTime()
    // Convert the timestamp to seconds (integer)
    const timestampInSeconds = Math.floor(timestamp / 1000)

    return timestampInSeconds
  }

  async function fetchAppointments (): Promise<void> {
    try {
      const response = await Api.get('/appointments/dentists/dentist@gmail.com/') // NB! replace with actual email
      const appointments = response.data // Assuming your API response contains the appointments
      const formattedAppointments = appointments.map((appointment: any) => ({
        id: appointment.id,
        title: appointment.patientId !== null ? appointment.patientId : '', // Make sure to replace 'title' with the actual property name
        start: new Date(appointment.start_timestamp * 1000).toISOString().slice(0, 16),
        end: new Date(appointment.end_timestamp * 1000).toISOString().slice(0, 16)
      }))

      setSlots(formattedAppointments)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }
  /**
 * Adds a new appointment to the database and updates the calendar.
 *
 * @param {Appointment} appointment - The appointment to be added.
 */
  async function addAppointment (appointment: Appointment): Promise<void> {
    try {
      const startTimestamp = parseDateStringToInteger(newAppointment().start)
      const endTimestamp = parseDateStringToInteger(newAppointment().end)
      const formattedAppointment = {
        start_timestamp: startTimestamp,
        end_timestamp: endTimestamp,
        dentistId: 'dentist@gmail.com' // Replace with actual dentist email from local storage
      }
      await Api.post('/appointments', formattedAppointment)
        .then(() => {
          calendarRef.current?.addEvent(appointment)
        })
    } catch (error) {
      throw new Error('Something went wrong, try again.')
    }
    // Reset the new appointment state
    setNewAppointment({
      id: '',
      title: '',
      start: '',
      end: ''
    })
    // Hide the "Add slot" form
    setShowForm(false)
  }

  /**
 * Deletes the selected appointment from array and updates calendar.
 *
 * @param appointmentId - The id of the appointment to be removed.
 */
  async function deleteAppointment (appointmentId: string): Promise<void> {
    try {
      await Api.delete(`/appointments/${appointmentId}`).then(() => {
        calendarRef.current?.getEventById(appointmentId)?.remove()
        // Add any additional actions you want to perform after successful deletion
        console.log('Appointment deleted successfully')
      })
    } catch (error) {
      console.error('Error deleting appointment:', error)
      // Handle the error, show a message to the user, etc.
      throw new Error('Error deleting appointment')
    }
  }

  // Effect to initialize FullCalendar and manage its lifecycle
  createEffect(async () => {
    await fetchAppointments()
    const calendarEl: HTMLElement | null = document.getElementById('calendar')
    if (calendarEl != null) {
      // Create a FullCalendar instance
      const calendar: Calendar = new Calendar(calendarEl, {
        plugins: [timeGridPlugin],
        initialView: 'timeGridWeek',
        locale: 'en-GB',
        customButtons: {
          addButton: {
            text: 'Add a slot',
            click: function () {
              setShowForm(!showForm())
            }
          }
        },
        headerToolbar: {
          left: 'prev,next',
          center: 'title',
          right: 'timeGridWeek,timeGridDay addButton'
        },
        firstDay: 1, // Week starts with a Monday
        views: {
          timeGrid: {
            allDaySlot: false
          }
        },
        nowIndicator: true,
        // Define the class for styling for unbooked and booked events.
        eventClassNames: function (arg: EventContentArg) {
          return arg.event.title === '' ? 'unbooked-event' : 'booked-event'
        },
        events: slots().map((appointment) => ({
          id: appointment.id, // Use your own appointment ID
          title: appointment.title,
          start: appointment.start,
          end: appointment.end
        })),
        eventClick: ({ event }: EventClickArg) => {
          setSelectedEventId(event.id) // Store the selected event ID
          setShowConfirmation(true)
        }
      })

      setInterval(async () => {
        await fetchAppointments()
        const events = [...slots()]
        calendar.setOption('events', events)
      }, 5000)

      calendarRef.current = calendar
      calendar.render()
    }
  })

  return (
    <>
      <div class='flex flex-row h-screen justify-center items-center'>
        <div class='h-5/6 w-5/6' id='calendar'></div>
        {showForm() && (
          <form
            class='z-30 flex flex-col justify-between items-center absolute top-20 right-10 p-4 bg-primary shadow-xl rounded'
            id='eventForm'
            onSubmit={(e) => {
              e.preventDefault()
              handleFormSubmit(e).catch((error) => {
                console.error('Error adding appointment:', error)
                // Handle the error, show a message to the user, etc.
              })
            }}
          >
            <div class='flex flex-col'>
              <label>Start:</label>
              <input
                type='datetime-local'
                placeholder=''
                value={newAppointment().start}
                onChange={(event) => {
                  setNewAppointment({ ...newAppointment(), start: event.target.value })
                }}
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div class='flex flex-col'>
              <label>End:</label>
              <input
                type='datetime-local'
                value={newAppointment().end}
                onChange={(event) => {
                  setNewAppointment({ ...newAppointment(), end: event.target.value })
                }}
                required
                min={newAppointment().start}
              />
            </div>
            <div class='flex flex-row mt-3'>
            <button
                class='bg-secondary rounded text-white p-2 mr-3'
                type='button'
                onClick={() => {
                  // Reset the new appointment state to empty values
                  setNewAppointment({
                    id: '',
                    title: '',
                    start: '',
                    end: ''
                  })
                  // Hide the form
                  setShowForm(false)
                }}
              >
                Cancel
              </button>
               <button class='bg-secondary rounded text-white p-2 ' type='submit'>
              Add Event
            </button>
            </div>

          </form>
        )}
      </div>

      {showConfirmation() && (
          <ConfirmationPopup
          onConfirm={() => {
            const eventId = selectedEventId()
            if (eventId !== null) {
              deleteAppointment(eventId).then(() => {
                setShowConfirmation(false)
              }).catch((error) => {
                console.error('Error deleting appointment:', error)
                // Handle the error, show a message to the user, etc.
              })
            }
          }}
          onCancel={() => {
            setShowConfirmation(false)
          }}
        />
      )}
    </>
  )
}
