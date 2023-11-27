import { createSignal, onCleanup, type JSX } from 'solid-js'
import NotificationsList from './NotificationList'
import { type NotificationData } from './types'

export default function Notifications (): JSX.Element {
  const [notifications, setNotifications] = createSignal<NotificationData[]>([
    // To remove the hard coded data
    {
      id: '1',
      date: new Date().toISOString().slice(0, 16),
      message: 'Your appointment scheduled for December 17th has been canceled due to unexpected staff scheduling changes. Your appointment scheduled for December 17th has been canceled due to unexpected staff scheduling changes'
    },
    {
      id: '2',
      date: new Date().toISOString().slice(0, 16),
      message: 'Your appointment on March 20th has been canceled due to severe weather conditions affecting clinic operations'
    },
    {
      id: '4',
      date: new Date().toISOString().slice(0, 16),
      message: 'Your appointment scheduled for December 17th has been canceled due to unexpected staff scheduling changes'
    },
    {
      id: '4',
      date: new Date().toISOString().slice(0, 16),
      message: 'We regret to inform you that your appointment on February 10th has been canceled due to an unexpected medical emergency'
    }
  ])

  onCleanup(() => {
    setNotifications([])
  })

  return (
    <div class="h-full w-full flex flex-col justify-start align-left mt-4">
      <h1 class="text-2xl font-bold pl-10 mt-6 mb-4">Notifications</h1>
      <NotificationsList notifications={notifications()} />
    </div>
  )
}
