import { createSignal, onCleanup, type JSX } from 'solid-js'
import NotificationsList from './NotificationList'
import { type NotificationData } from './types'

export default function Notifications (): JSX.Element {
  const [notifications, setNotifications] = createSignal<NotificationData[]>([
    // To remove the hard coded data
    {
      id: '1',
      date: new Date().toISOString().slice(0, 16),
      message: 'This is the first hard coded notification message'
    },
    {
      id: '2',
      date: new Date().toISOString().slice(0, 16),
      message: 'This is the second hard coded notification message'
    },
    {
      id: '3',
      date: new Date().toISOString().slice(0, 16),
      message: 'This is the thrid hard coded notification message'
    }
  ])

  onCleanup(() => {
    setNotifications([])
  })

  return (
    <div class="h-full w-full flex flex-col justify-start items-center">
      <h1 class="text-2xl font-bold pl-10 mt-6">Notifications</h1>
      <NotificationsList notifications={notifications()} />
    </div>
  )
}
