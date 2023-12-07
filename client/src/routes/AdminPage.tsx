import { type JSX } from 'solid-js/jsx-runtime'
import Notifications from '../components/Admin/AdminPage'

export default function AdminPage (): JSX.Element {
  return (
    <div class="flex flex-col h-screen w-full">
      <Notifications />
    </div>
  )
}
