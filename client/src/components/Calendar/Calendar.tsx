import { type JSX } from 'solid-js/jsx-runtime'
import { onCleanup, createEffect, createSignal } from 'solid-js'
import { Calendar } from '@fullcalendar/core'
import timeGridPlugin from '@fullcalendar/timegrid'
import './Calendar.css'
import { type Appointment } from '../../utils/types'
import { type EventContentArg, type EventClickArg } from '@fullcalendar/core'

export default function DentistCalendar (): JSX.Element {
  const [showForm, setShowForm] = createSignal<boolean>(false)
  const calendarRef: { current: Calendar | null } = { current: null }

  // Temporary array of appointment, will be modified once integrated with backend.
  const slots: Appointment[] = [
    {
      id: '1',
      title: 'testevent',
      start: '2023-11-18T10:31',
      end: '2023-11-18T12:31'
    }
  ]
  const [newAppointment, setNewAppointment] = createSignal<Appointment>({
    id: '',
    title: '',
    start: '',
    end: ''
  })

  /**
 * Adds a new appointment to the slots array and updates the calendar.
 *
 * @param {Appointment} appointment - The appointment to be added.
 */
  function addAppointment (appointment: Appointment): void {
    slots.push(appointment)

    // Update the FullCalendar instance with the new appointment
    calendarRef.current?.addEvent(appointment)
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
  function deleteAppointment (appointmentId: string): void {
    const index = slots.findIndex((appointment) => appointment.id === appointmentId)
    if (index !== -1) {
      slots.splice(index, 1)
      calendarRef.current?.getEventById(appointmentId)?.remove()
    }
  }

  // Effect to initialize FullCalendar and manage its lifecycle
  createEffect(() => {
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
        events: [...slots],
        eventClick: ({ event }: EventClickArg) => {
          const confirmation = window.confirm('Do you want to delete this event?')
          if (confirmation) {
            deleteAppointment(event.id)
          }
        }
      })

      calendarRef.current = calendar
      calendar.render()

      // Use onCleanup to destroy the calendar when the component unmounts
      onCleanup(() => {
        calendar.destroy()
      })
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
              addAppointment(newAppointment())
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
    </>
  )
}
