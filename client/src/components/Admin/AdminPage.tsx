import { createSignal, type JSX } from 'solid-js'
import './AdminPage.css'
import { Graph } from './Graph'

export interface Tab {
  tab: string
  title: string
}

// Define the Admin component
export default function Admin (): JSX.Element {
  // State to track the active tab
  const [activeTab, setActiveTab] = createSignal('general')
  const [activeTime, setActiveTime] = createSignal('1m')

  // Function to render tab buttons based on the data
  const tabComponent = (item: Tab): JSX.Element => {
    return (
        <TabButton tab={item.tab} activeTab={activeTab} setActiveTab={setActiveTab}>
          {item.title}
        </TabButton>
    )
  }

  const timeComponent = (item: Tab): JSX.Element => {
    return (
        <TabButton tab={item.tab} activeTab={activeTime} setActiveTab={setActiveTime}>
          {item.title}
        </TabButton>
    )
  }
  const times = [
    { tab: '60', title: '1m' },
    { tab: '300', title: '5m' },
    { tab: '3600', title: '1h' },
    { tab: '86400', title: '1d' },
    { tab: '2592000', title: '30d' }
  ]

  // Data for tabs
  const categories = [
    { tab: 'general', title: 'General' },
    { tab: 'patients', title: 'Patients' },
    { tab: 'appointments', title: 'Appointments' },
    { tab: 'dentists', title: 'Dentists' }
  ]
  return (
    <div class="p-8">
        <p class="text-2xl font-bold px-2">Statistics</p>

        <div class="flex items-center mt-2 flex-wrap gap-y-4">
        {categories.map(item => tabComponent(item))}

      </div>

      <div class="flex items-center justify-center shadow-md">
        <Graph type={activeTab()} timeframe={activeTime()}/>
      </div>

      <div class="flex justify-end items-center mt-2 mb-2 flex-wrap gap-y-4">
      {times.map(item => timeComponent(item))}

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
