import { type JSX } from 'solid-js/jsx-runtime'
import Notifications from '../components/Notifications/Notifications'

export default function NotificationsPage (): JSX.Element {
  return (
    <div class="flex flex-col h-screen w-full">
      <Notifications />
    </div>
  )
}
