import { type JSX } from 'solid-js/jsx-runtime'
import { onCleanup, createEffect, createSignal } from 'solid-js'
import { Calendar } from '@fullcalendar/core'
import timeGridPlugin from '@fullcalendar/timegrid'

export default function DentistCalendar (): JSX.Element {
  interface Appointment {
    id: string
    title: string
    start: string
    end: string
  }

  // Use createEffect to run code when the component mounts
  const [events, setEvents] = createSignal<Appointment[]>([])
  const [newAppointment, setNewAppointment] = createSignal<Appointment>({
    id: '',
    title: '',
    start: '',
    end: ''
  })

  function addAppointment (appointment: Appointment): void {
    console.log(appointment)
  }

  createEffect(() => {
    const calendarEl: HTMLElement | null = document.getElementById('calendar')

    if (calendarEl != null) {
      // Create a FullCalendar instance
      const calendar: any = new Calendar(calendarEl, {
        plugins: [timeGridPlugin],
        initialView: 'timeGridWeek',
        headerToolbar: {
          left: 'prev,next',
          center: 'title',
          right: 'timeGridWeek,timeGridDay' // user can switch between the two
        },
        // Week starts with a Monday
        firstDay: 1,
        views: {
          timeGrid: {
            allDaySlot: false
          }
        },
        nowIndicator: true,
        events: events()
      })

      // Render the calendar
      calendar.render()

      // Use onCleanup to destroy the calendar when the component unmounts
      onCleanup(() => {
        calendar.destroy()
      })
    }
  })

  return (
    <>
      <div class='flex h-screen justify-center items-center'>
        <div class='h-5/6 w-5/6' id='calendar'></div>
        <form
          class='flex flex-col justify-center items-center'
          id='eventForm'
          onSubmit={(e) => {
            e.preventDefault() // Prevent default form submission
            addAppointment(newAppointment())
          }}
        >
          <label>Title:</label>
          <input
            type='text'
            value={newAppointment().title}
            onChange={(event) => {
              setNewAppointment({ ...newAppointment(), title: event.target.value })
            }}
            required
          />

          <label>Start Date and Time:</label>
          <input
            type='datetime-local'
            value={newAppointment().start}
            onChange={(event) => {
              setNewAppointment({ ...newAppointment(), start: event.target.value })
            }}
            required
          />

          <label>End Date and Time:</label>
          <input
            type='datetime-local'
            value={newAppointment().end}
            onChange={(event) => {
              setNewAppointment({ ...newAppointment(), end: event.target.value })
            }}
            required
          />

          <button type='submit'>Add Event</button>
        </form>
      </div>
    </>
  )
}
