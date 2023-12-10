import { createEffect, createSignal, type Accessor, onCleanup } from 'solid-js'
import { Api } from '../../utils/api'
import { type NotificationData } from '../Notifications/types'

export interface NotificationsResponse {
  length: number
  email: string
  data: NotificationData[]
}

export interface NotificationCountData {
  currentCount: number
  parsedCurrentCount: number
}

export const useNotification = (): {
  notificationCount: Accessor<number>
  showNotificationDot: Accessor<boolean>
} => {
  const [notificationCount, setNotificationCount] = createSignal(0)
  const [showNotificationDot, setShowNotificationDot] = createSignal(false)

  const fetchNotificationCount = async (): Promise<void> => {
    try {
      const currentCount: string | null = localStorage.getItem('notificationsCount')
      const parsedCurrentCount: number = currentCount !== null ? parseInt(currentCount, 10) : 0

      const notificationResponse = await Api.get<NotificationsResponse>('sessions/whois', { withCredentials: true })
      const userEmail: string = notificationResponse.data.email

      const response = await Api.get<NotificationsResponse>(`notifications/${userEmail}`, { withCredentials: true })

      const count: number = response.data.length

      localStorage.setItem('notificationsCount', count.toString())

      const temp: number = count - parsedCurrentCount

      const counter: string | null = localStorage.getItem('counter')
      const parsedCounter: number = counter !== null ? parseInt(counter, 10) : 0

      const totalCounter: number = temp + parsedCounter
      localStorage.setItem('counter', totalCounter.toString())
      setNotificationCount(totalCounter)
      setShowNotificationDot(totalCounter > 0)
    } catch (error) {
      console.error('Error fetching notification count:', error)
    }
  }

  createEffect(async () => {
    await fetchNotificationCount()
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setInterval(async () => {
      await fetchNotificationCount()
    }, 1000)
    onCleanup(() => {})
  })

  return {
    notificationCount,
    showNotificationDot
  }
}
