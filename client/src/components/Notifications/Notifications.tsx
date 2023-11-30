import { createSignal, onCleanup, type JSX, createEffect } from 'solid-js'
import NotificationsList from './NotificationList'
import { type NotificationData } from './types'
import { Api } from '../../utils/api'

export default function Notifications (): JSX.Element {
  const [notifications, setNotifications] = createSignal<NotificationData[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [notificationCount, setNotificationCount] = createSignal<number>(0)

  createEffect(async () => {
    console.log('Notification count (notifications):', notificationCount())
    await fetchNotifications()
  })

  /**
   * Get the current logged in user's email.
   * @returns Current user email (string)
   */
  async function getEmail (): Promise<string> {
    const notificationResponse = await Api.get('sessions/whois', { withCredentials: true })
    return notificationResponse.data.email
  }

  // Function to fetch notifications from the server
  const fetchNotifications = async (): Promise<void> => {
    try {
      // Retrieve user's email
      const userEmail = await getEmail()
      // Fetch notifications based on the user's email
      const response = await Api.get(`notifications/${userEmail}`, { withCredentials: true })
      const notificationData = response.data
      console.log(response.data)

      // Update the notifications signal with the fetched data
      setNotifications(notificationData)
      setNotificationCount(notificationData.length)
    } catch (error) {
      // Handle errors during the notification fetching proces
      console.error('Error fetching or setting notifications:', error)
      throw new Error('Error fetching the notifications')
    }
  }

  // Cleanup function to reset notifications
  onCleanup(() => {
    setNotifications([])
  })

  // Render the Notifications component
  return (
    <div class="h-full w-full flex flex-col justify-start align-left mt-4">
      <h1 class="text-2xl font-bold pl-10 mt-6 mb-4">Notifications</h1>
      <NotificationsList notifications={notifications()} />
    </div>
  )
}
