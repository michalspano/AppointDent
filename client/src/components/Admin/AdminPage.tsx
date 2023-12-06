import { createSignal, type JSX, Show } from 'solid-js'
import './AdminPage.css'

export interface Place {
  tab: string
  title: string
}

// Define the Admin component
export default function Admin (): JSX.Element {
  // State to track the active tab
  const [activeTab, setActiveTab] = createSignal('general')

  // Function to render tab buttons based on the data
  const tabComponent = (item: Place): JSX.Element => {
    return (
        <TabButton tab={item.tab} activeTab={activeTab} setActiveTab={setActiveTab}>
          {item.title}
        </TabButton>
    )
  }

  // Data for tabs
  const data = [
    { tab: 'general', title: 'General' },
    { tab: 'patients', title: 'Patients' },
    { tab: 'appointments', title: 'Appointments' },
    { tab: 'dentists', title: 'Dentists' }
  ]
  return (
    <div class="flex flex-col p-8">
        <div class="flex items-center">
      <h2 class="text-2xl font-bold px-2">Statistics</h2>
        {data.map(item => tabComponent(item))}
      </div>

      <Show when={activeTab() === 'general'}>
      <div class="flex items-center justify-center mt-8">
        <GeneralContent />
        </div>
      </Show>
      <Show when={activeTab() === 'patients'}>
      <div class="flex items-center justify-center mt-8">
        <PatientsContent />
        </div>
      </Show>
      <Show when={activeTab() === 'appointments'}>
      <div class="flex items-center justify-center mt-8">
        <AppointmentsContent />
        </div>
      </Show>
      <Show when={activeTab() === 'dentists'}>
        <div class="flex items-center justify-center mt-8">
        <DentistsContent />
        </div>
      </Show>
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

  // Custom button styling with an event handler
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

// To replace with graph components
function GeneralContent (): JSX.Element {
  return <GraphComponentContainer>
    General Graph Component
    </GraphComponentContainer>
}

function PatientsContent (): JSX.Element {
  return <GraphComponentContainer>
    Graph Component for Patients
    </GraphComponentContainer>
}

function AppointmentsContent (): JSX.Element {
  return <GraphComponentContainer>
    Graph Component for Appointments
    </GraphComponentContainer>
}

// add placeholders
function DentistsContent (): JSX.Element {
  return <GraphComponentContainer>
  Graph Component for Dentists
  </GraphComponentContainer>
}

// Container component for graph components with styling
function GraphComponentContainer (props: { children: string }): JSX.Element {
  const containerClasses = 'h-96 w-4/5 border-2 border-gray-500 rounded-lg relative shadow-lg px-8 py-8 text-gray-500 mt-4 flex items-center justify-center'
  return (
      <div class={containerClasses}>
        {props.children}
      </div>
  )
}
