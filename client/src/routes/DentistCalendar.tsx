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
  }
  function deleteAppointment (eventId: string): void {
    const index = slots.findIndex((event) => event.id === eventId)
    if (index !== -1) {
      slots.splice(index, 1)
      calendarRef.current?.getEventById(eventId)?.remove()
    }
  }
  const calendarRef: { current: any } = { current: null }

  createEffect(() => {
    const calendarEl: HTMLElement | null = document.getElementById('calendar')
    if (calendarEl != null) {
      // Create a FullCalendar instance
      const calendar: any = new Calendar(calendarEl, {
        plugins: [timeGridPlugin],
        initialView: 'timeGridWeek',
        locale: 'en-GB',
        headerToolbar: {
          left: 'prev,next',
          center: 'title',
          right: 'timeGridWeek,timeGridDay' // user can switch between the two
        },
        // Week starts with a Monday
        firstDay: 1,

        views: {

          timeGrid: {
            allDaySlot: false,
            slotMinTime: '06:00', // Minimum time to display (6:00 AM)
            slotMaxTime: '20:00' // Maximum time to display (8:00 PM)
          }
        },
        nowIndicator: true,
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
