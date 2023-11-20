import { type JSX } from 'solid-js/jsx-runtime'
import { onCleanup, createEffect, createSignal } from 'solid-js'
import { Calendar } from '@fullcalendar/core'
import timeGridPlugin from '@fullcalendar/timegrid'
import './Calendar.css'

export default function DentistCalendar (): JSX.Element {
  interface Appointment {
    id: string
    title: string
    start: string
    end: string
  }

  // Use createEffect to run code when the component mounts
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

  function addAppointment (appointment: Appointment): void {
    slots.push(appointment)
    calendarRef.current?.addEvent(appointment)
    setNewAppointment({
      id: '',
      title: '',
      start: '',
      end: ''
    })
    setShowForm(false)
  }
  function deleteAppointment (eventId: string): void {
    const index = slots.findIndex((event) => event.id === eventId)
    if (index !== -1) {
      slots.splice(index, 1)
      calendarRef.current?.getEventById(eventId)?.remove()
    }
  }
  const [showForm, setShowForm] = createSignal<boolean>(false)
  const calendarRef: { current: any } = { current: null }

  createEffect(() => {
    const calendarEl: HTMLElement | null = document.getElementById('calendar')
    if (calendarEl != null) {
      // Create a FullCalendar instance
      const calendar: any = new Calendar(calendarEl, {
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
          right: 'timeGridWeek,timeGridDay addButton' // user can switch between the two
        },
        // Week starts with a Monday
        firstDay: 1,
        views: {
          timeGrid: {
            allDaySlot: false
          }
        },
        nowIndicator: true,
        eventClassNames: function (arg: any) {
          return arg.event.title === '' ? 'unbooked-event' : 'booked-event'
        },
        events: [...slots],
        eventClick: ({ event }: { event: any }) => {
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
                onClick={() => setShowForm(false)}
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
