import { Api } from '../../utils/api'
import { isPatient, fetchPatientEmail } from '../../utils'
import default_doctor from '../../assets/default_doctor.jpg'
import BookingConfirmationPopup from './BookingConfirmation'
import { useParams, useNavigate, useSearchParams } from '@solidjs/router'
import { type Signal, createSignal, type JSX, createEffect, onCleanup, Show, onMount } from 'solid-js'
import {
  type Appointment,
  type Subscription,
  SubscriptionStatus,
  type FilterInterval,
  type AppointmentResponse,
  type GroupedAppointments,
  type DentistRegistration
} from '../../utils/types'

export default function AppointmentsList (): JSX.Element {
  const navigate = useNavigate()
  const FETCH_INTERVAL: Readonly<number> = 5000
  const [queryParams] = useSearchParams()

  /**
   * Continuous monitor for the user's authentication status.
   */
  createEffect(async () => {
    const authResult: boolean = await isPatient()
    if (!authResult) navigate('/calendar', { replace: true })
  })

  /**
   * The onMount hook is called when the component is mounted.
   * This logic is extracted from the createEffect hook to avoid
   * calling the API multiple times.
   */
  onMount(() => {
    /* This is just a detail, but FilterInterval doesn't permit null values
     * hence an empty string is used instead. This is not checked by TS and
     * is only to ensure consistency. */
    setTimeRange({
      start: queryParams.from ?? '',
      end: queryParams.to ?? ''
    })
    const params: Record<string, string> = useParams<{ email: string }>()
    setDentistEmail(atob(params.email))

    /**
     * Fetch patient's email address.
     * Determine if the patient is subscribed to the selected dentist.
     * This check is carried when the component is mounted. The status
     * shall only be handled when patient's email is fetched.
     */
    fetchPatientEmail().then((email: string) => {
      setPatientEmail(email); void handleSubStatus()
    }).catch((error: Error) => {
      console.error('Error fetching patient email:', error)
    })

    /**
     * Fetches the dentist's information in a continuous manner.
     */
    void fetchAppointments(); void fetchDentist()
    setInterval(() => { void fetchAppointments() }, FETCH_INTERVAL)
  })

  /**
   * Fetches all available appointments for the dentist. If a valid time range is specified,
   * then only the appointments within the given time range are fetched.
   */
  async function fetchAppointments (): Promise<void> {
    try {
      const hasInterval: boolean = (timeRange().start !== '') &&
                                   (timeRange().end !== '')

      // Formatted request URL with all *default* parameters
      let requestURL: string = `/appointments/dentists/${dentistEmail()}` +
                                `?userId=${patientEmail()}&onlyAvailable=true`

      // If the time range is given, add the query parameters to the request URL
      // Afterwards, fetch the appointments based on the query parameters
      if (hasInterval) {
        const filterSubquery: string = `&from=${timeRange().start}&to=${timeRange().end}`
        requestURL += filterSubquery
      }

      const appointments: AppointmentResponse[] = (
        await Api.get(requestURL, { withCredentials: true })
      ).data ?? []

      // Format each 'raw' response of AppointmentResponse type to the Appointment type
      const formattedAppointments: Appointment[] =
        appointments.map((appointment: AppointmentResponse) => ({
          title: '', // can be set to empty because it's not used in the view
          id: appointment.id,
          start: new Date(appointment.start_timestamp * 1000).toLocaleString('sv-SE').toString(),
          end: new Date(appointment.end_timestamp * 1000).toLocaleString('sv-SE').toString()
        }))

      // Group appointments by day
      const groupedAppointments: Record<string, Appointment[]> =
        formattedAppointments.reduce((acc: Record<string, Appointment[]>, appointment: Appointment) => {
          const day: string = appointment.start.slice(0, 10)
          if (acc[day] === undefined) acc[day] = []
          acc[day].push(appointment)
          return acc
        }, {})

      // Dump to an array for sorting
      const groupedAppointmentsArray: GroupedAppointments[] =
        Object.entries(groupedAppointments).map(([day, appointments]) => (
          { day, appointments }
        ))

      // Sort the grouped appointments by day
      groupedAppointmentsArray.sort((a, b) => (a.day > b.day ? 1 : -1))
      setAvailableDays(groupedAppointmentsArray)
    } catch (error) {
      throw new Error('Error fetching appointments')
    }
  }

  // TODO: add proper types.
  async function fetchDentist (): Promise<void> {
    try {
      const response = await Api.get(`/dentists/${dentistEmail()}`)
      const dentistRes = response.data[0]
      setDentist(dentistRes)
      setDentistName(`${dentist()?.firstName} ${dentist()?.lastName}`)
      setDentistLocation(`${dentist()?.clinicStreet}, ${dentist()?.clinicHouseNumber} ${dentist()?.clinicZipCode} ${dentist()?.clinicCity}`)
      setDentistImage(dentist()?.picture ?? default_doctor) // TODO change to dentist()?.picture when we add image parsing support
    } catch (error) {
      throw new Error('Error fetching dentist')
    }
  }

  // TODO: add proper types.
  async function bookAppointment (appointment: Appointment): Promise<void> {
    const appointmentId = appointment.id
    try {
      const requestURL: string = `/appointments/${appointmentId}?patientId=${patientEmail()}&toBook=true`
      await Api.patch(requestURL, {}, { withCredentials: true }
      ).then(() => {
        console.log('Appointment booked successfully.')
      })
    } catch (error) {
      throw new Error('Error booking appointment')
    }
  }

  /**
   * @description a function that handles the subscription event. It is triggered when
   * the button is clicked. It sends a request to the API to subscribe/unsubscribe the
   * patient to the selected dentist.
   *
   * @see SubscriptionStatus
   */
  const onClickSubButton = async (event: SubscriptionStatus): Promise<void> => {
    const requestURL: string = `/appointments/subscribe/${dentistEmail()}/${patientEmail()}`

    // TODO: this can be perhaps extracted to separate functions?
    if (event === SubscriptionStatus.UNSUBSCRIBED) {
      await Api.delete(requestURL, { withCredentials: true })
        .then(() => setIsSubscribed(false))
        .catch((error: Error) => {
          console.error('Error unsubscribing to dentist:', error)
        })
    } else if (event === SubscriptionStatus.SUBSCRIBED) {
      await Api.post(requestURL, {}, { withCredentials: true })
        .then(() => setIsSubscribed(true))
        .catch((error: Error) => {
          console.error('Error subscribing to dentist:', error)
        })
    }
  }

  /**
   * @description a function that checks if the current patient is subscribed to the selected dentist.
   * In updates the signal isSubscribed accordingly. This check relies on the appointment endpoint, hence
   * requires a request to the API - for that reason, this endpoint shall be used with caution.
   *
   * @see isSubscribed
   * @see Signal
   */
  const handleSubStatus = async (): Promise<void> => {
    const requestURL: string = `/appointments/subscribe/${dentistEmail()}/${patientEmail()}`

    Api.get(requestURL, { withCredentials: true })
      .then(response => {
        const data: Subscription[] = response.data
        setIsSubscribed(data.length > 0) // if there exists a subscription, then the patient is subscribed
      })
      .catch(() => { console.error('Error fetching subscription status') })
  }

  /* Declaration of signals */
  const [timeRange, setTimeRange]: Signal<FilterInterval> = createSignal<FilterInterval>({
    start: '', end: ''
  })
  const [patientEmail, setPatientEmail]: Signal<string> = createSignal<string>('')
  const [isSubscribed, setIsSubscribed]: Signal<boolean> = createSignal<boolean>(false)
  const [availableDays, setAvailableDays] = createSignal<GroupedAppointments[]>([])
  const [availableTime, setAvailableTime] = createSignal<Appointment[]>([])
  const [selectedDate, setSelectedDate] = createSignal<string>('')
  const [selectedTime, setSelectedTime] = createSignal<string>('')
  const [showConfirmation, setShowConfirmation] = createSignal<boolean>(false)
  const [selectedAppointment, setSelectedAppointment] = createSignal<Appointment | null>(null)
  const [dentist, setDentist] = createSignal<DentistRegistration>()
  const [dentistEmail, setDentistEmail] = createSignal<string>('')
  const [dentistName, setDentistName] = createSignal<string>()
  const [dentistLocation, setDentistLocation] = createSignal<string>()
  const [dentistImage, setDentistImage] = createSignal<string>()

  // TODO: add proper types to all function below.
  const formatDate = (date: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric', month: 'short', year: 'numeric'
    }
    return new Date(date).toLocaleDateString('sv-SE', options)
  }

  const formatTime = (date: string): string => {
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
    return new Date(date).toLocaleTimeString('sv-SE', options)
  }

  const formatTimeEntry = (appointment: any): string => {
    return `${formatTime(appointment.start)} - ${formatTime(appointment.end)}`
  }

  const onDateSelect = (appointment: any): void => {
    setSelectedTime('')
    setSelectedDate(appointment.day)
    const availableDaysData = availableDays()
    const isMatchingDay = (entry: { day: any }): boolean => entry.day === appointment.day
    const selectedDayData = availableDaysData.find(isMatchingDay)
    if (selectedDayData !== undefined) {
      setAvailableTime(selectedDayData.appointments)
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
  onCleanup(() => { })

  return (
    <div class="h-full w-full flex flex-col justify-center items-center lg:justify-start lg:items-start overflow-hidden">
      <div class='w-full flex justify-start m-10'>
        <h1 class='text-2xl font-bold pl-10'>Available Slots</h1>
      </div>
      <div class='flex flex-col lg:flex-row justify-start m-6 lg:ml-20 max-w-md md:max-w-full lg:max-w-full'>
        <div class='flex flex-col justify-start sm:items-center lg:w-2/5'>
          <div class="shadow p-4 rounded-lg">
            <img class='rounded-lg lg:11/12 sm:w-6/12 mx-auto' src={dentistImage()} alt="Dentist image" />
            <div class='flex-col text-center mt-4 text-lg'>
              <p class='font-semibold text-black'><span class="font-normal">Dentist:</span> {dentistName()}</p>
              <p class='mt-2 text-black'>Location: <strong>{dentistLocation()}</strong></p>
              <button class='bg-primary rounded-lg text-white shadow-sm p-4 mt-4 px-6 min-w-[30%]'
                onClick={
                  () => {
                    void onClickSubButton(
                      isSubscribed()
                        ? SubscriptionStatus.UNSUBSCRIBED
                        : SubscriptionStatus.SUBSCRIBED)
                  }
                }>
                {isSubscribed()
                  ? (<span>&#128277; Unsubscribe</span>)
                  : (<span>&#128276; Subscribe</span>)}
              </button>
            </div>
          </div>
        </div>
        <div>
          <div class="m-6 lg:ml-10 mt-0">
            <h3 class='desc text-xl text-slate-500 xs:mt-8 md:mt-0 font-semibold'>Please, select your preferred date and time to schedule your appointment.</h3>
            <h3 class='text-lg mt-10 font-medium'>Select Date</h3>
            <div class="overflow-x-scroll max-w-lg">
              <div class='flex flex-no-wrap gap-15'>
                <Show when={availableDays().length > 0} fallback={<p>No available times exist at the moment.</p>}>
                  {availableDays().map((appointment) => (
                    <div class={`flex m-4 p-4 rounded-lg cursor-pointer font-semibold items-center justify-center ${selectedDate() === appointment.day ? 'bg-primary text-white shadow' : 'shadow'}`} onClick={() => { onDateSelect(appointment) }}>
                      <span class="text-md">{formatDate(appointment.day)}</span>
                    </div>
                  ))}
                </Show>
              </div>
            </div>
            {(selectedDate() !== '') && (
              <div class='w-full'>
                <h3 class='text-lg mt-6 font-medium'>Select Time</h3>
                {availableTime().length > 0
                  ? <div class="grid grid-cols-3 xs:grid-cols-1 s:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-15 w-11/12">
                    {availableTime().map((appointment: Appointment) => (
                      <div class={`flex w-35 m-4 h-20 w-38 rounded-lg cursor-pointer font-semibold items-center justify-center ${selectedAppointment() === appointment ? 'bg-primary text-white shadow' : 'shadow'}`} onClick={() => { onTimeSelect(appointment) }}>
                        {formatTimeEntry(appointment)}
                      </div>
                    ))}
                  </div>
                  : <p>No available time slots for the selected date.</p>}
              </div>
            )}
            {(selectedDate() !== '') && (selectedTime() !== '') && (
              <button class='bg-secondary rounded-lg text-white p-4 mr-3 mt-6 ml-4 px-8' onClick={onBookAppointment}>
                Book Appointment
              </button>
            )}
          </div>
        </div>
      </div>
      {showConfirmation() && dentistName() !== null && dentistLocation() !== null && (
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
          dentistName={dentistName()}
          location={dentistLocation()}
          date={`${formatDate(selectedDate())} at ${formatTimeEntry(selectedAppointment())}`}
        />
      )}
    </div>
  )
}
