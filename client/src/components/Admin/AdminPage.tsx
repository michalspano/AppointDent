import { createSignal, type JSX, Show } from 'solid-js'

export interface Place {
  tab: string
  title: string
}

// To define the Admin component
export default function Admin (): JSX.Element {
  // To track the active tab
  const [activeTab, setActiveTab] = createSignal('general')

  const tabComponent = (item: Place): JSX.Element => {
    return (
        <TabButton tab={item.tab} activeTab={activeTab} setActiveTab={setActiveTab}>
          {item.title}
        </TabButton>
    )
  }
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
        <GeneralContent />
      </Show>
      <Show when={activeTab() === 'patients'}>
        <PatientsContent />
      </Show>
      <Show when={activeTab() === 'appointments'}>
        <AppointmentsContent />
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

  return (
    <button
      class="px-4 py-2 text-black mr-4 text-lg"
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

// add placeholders
function DentistsContent (): JSX.Element {
  return <div class="h-96 w-4/5 border-2 border-gray-500 rounded-lg relative shadow-lg px-8 py-8 text-gray-500">
  Graph Component for Dentist
</div>
}
