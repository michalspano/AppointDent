import { createSignal, type JSX, Show } from 'solid-js'

// To define the Admin component
export default function Admin (): JSX.Element {
  // To track the active tab
  const [activeTab, setActiveTab] = createSignal('general')

  return (
    <div class="flex flex-col">
      <div class="flex">
        <TabButton tab="general" activeTab={activeTab} setActiveTab={setActiveTab}>
          General
        </TabButton>
        <TabButton tab="patients" activeTab={activeTab} setActiveTab={setActiveTab}>
          Patients
        </TabButton>
        <TabButton tab="appointments" activeTab={activeTab} setActiveTab={setActiveTab}>
          Appointments
        </TabButton>
        <TabButton tab="dentists" activeTab={activeTab} setActiveTab={setActiveTab}>
          Dentists
        </TabButton>
      </div>

      <Show when={activeTab() === 'general'}>
        <GeneralContent />
      </Show>
      <Show when={activeTab() === 'patients'}>
        <PatientsContent />
      </Show>
      <Show when={activeTab() === 'appointments'}>
        <AppointmentsContent />
      </Show>
      <Show when={activeTab() === 'dentists'}>
        <DentistsContent />
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

  return (
    <button
      class="px-4 py-2"
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
  return <div>General Content</div>
}

function PatientsContent (): JSX.Element {
  return <div>Patients Content</div>
}

function AppointmentsContent (): JSX.Element {
  return <div>Appointments Content</div>
}

function DentistsContent (): JSX.Element {
  return <div>Dentists Content</div>
}
