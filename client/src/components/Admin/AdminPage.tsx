import { createSignal, Show, type JSX, onCleanup } from 'solid-js'
import './AdminPage.css'
import { Graph } from './Graph/Graph'
import { getAvailableAppointments } from './data/appointments'

export interface Tab {
  tab: string
  title: string
}
void getAvailableAppointments()
// Define the Admin component
export default function Admin (): JSX.Element {
  // State to track the active tab
  const [activeTab, setActiveTab] = createSignal('appointments')
  const [availableAppointments, setAvailableAppointments] = createSignal(-1)
  // Function to render tab buttons based on the data
  const tabComponent = (item: Tab): JSX.Element => {
    return (
      <TabButton tab={item.tab} activeTab={activeTab} setActiveTab={setActiveTab}>
        {item.title}
      </TabButton>
    )
  }

  // Data for tabs
  const categories = [
    { tab: 'general', title: 'General' },
    { tab: 'patients', title: 'Patients' },
    { tab: 'appointments', title: 'Appointments' },
    { tab: 'dentists', title: 'Dentists' }
  ]

  // Keep track on the number of available appointments
  const autoFetchAppointments = setInterval(() => {
    getAvailableAppointments().then((result: number) => {
      setAvailableAppointments(result)
    }).catch((err) => {
      console.error(err)
      setAvailableAppointments(0)
    })
  }, 5000)

  // Destroy interval upon destruction of component
  onCleanup(() => {
    clearInterval(autoFetchAppointments)
  })
  return (
    <div class="p-8">
      <p class="text-2xl font-bold px-2">Statistics</p>
      <div class="flex items-center mt-2 flex-wrap gap-y-4">
        {categories.map(item => tabComponent(item))}
      </div>
      <Show when={activeTab() === 'appointments'}>
        <p class="mt-4">Available appointments: <Show when={availableAppointments() === -1} fallback={<span class="font-bold">{availableAppointments()}</span>}>...</Show></p>
      </Show>
      <div class="flex items-center justify-center flex-wrap">
        <Show when={activeTab() === 'general'}>
          <div class="sm:w-full md:w-3/6 p-3">
            <p class="font-bold">System requests</p>
            <Graph category={'/'} method={''} loggedInOnly={true} />
          </div>
        </Show>

        <Show when={activeTab() === 'appointments'}>
          <div class="md:w-3/6 sm:w-full p-3">
            <p class="font-bold">Booked appointments <span class="text-sm">(users)</span></p>
            <Graph category={'toBook=true'} method={'PATCH'} loggedInOnly={true} />
          </div>
          <div class="md:w-3/6 sm:w-full p-3">
            <p class="font-bold">Viewed appointments <span class="text-sm">(users)</span></p>
            <Graph category={'/appointments/dentists'} method={'GET'} loggedInOnly={true} />
          </div>
        </Show>

        <Show when={activeTab() === 'dentists'}>
          <div class="sm:w-full md:w-3/6 p-3">
            <p class="font-bold">Dentist registration requests</p>
            <Graph category={'/dentists/register'} method={'POST'} loggedInOnly={false} />
          </div>
          <div class="sm:w-full md:w-3/6 p-3">
            <p class="font-bold">Dentist login requests</p>
            <Graph category={'/dentist/login'} method={'POST'} loggedInOnly={false} />
          </div>
        </Show>

        <Show when={activeTab() === 'patients'}>
          <div class="sm:w-full md:w-3/6 p-3">
            <p class="font-bold">Patient registration requests</p>
            <Graph category={'/patients/register'} method={'POST'} loggedInOnly={false} />
          </div>
          <div class="sm:w-full md:w-3/6 p-3">
            <p class="font-bold">Patient login requests</p>
            <Graph category={'/patients/login'} method={'POST'} loggedInOnly={false} />
          </div>
        </Show>
      </div>
    </div>
  )
}

// TabButton component to handle tab clicks
function TabButton (props: {
  tab: string
  activeTab: () => string
  setActiveTab: (value: string) => void
  children: string
}): JSX.Element {
  const { tab, setActiveTab, children } = props
  return (
    <button
      class="custom-button mr-4"
      onClick={() => {
        setActiveTab(tab)
      }}
    >
      {children}
    </button>
  )
}
