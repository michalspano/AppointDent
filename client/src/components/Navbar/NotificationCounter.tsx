import { createSignal, type Accessor, onCleanup } from 'solid-js'
import { Api } from '../../utils/api'
import { type NotificationsResponse, type WhoisResponse } from '../../utils/types'

export const useNotification = (): {
  notificationCount: Accessor<number> // The number of unread notifications
  showNotificationDot: Accessor<boolean> // Tells us whether or not we should show dot
} => {
  const [notificationCount, setNotificationCount] = createSignal(0)
  const [showNotificationDot, setShowNotificationDot] = createSignal(false)
  // Used to prevent overlaying requests to BE
  let blocked: boolean = false
  /**
   * Used to retrieve the number of notifications in the system
   */
  const fetchNotificationCount = async (): Promise<void> => {
    try {
      blocked = true
      const whoIs: WhoisResponse = (await Api.get('sessions/whois', { withCredentials: true })).data
      const userEmail: string | undefined = whoIs.email

      const currentCount: string | null = localStorage.getItem(`${userEmail}/notificationsCount`)
      const parsedCurrentCount: number = currentCount !== null ? parseInt(currentCount) : 0

      const response: NotificationsResponse = (await Api.get(`notifications/${userEmail}`, { withCredentials: true })).data

      const count: number = response.length

      let unreadNotifications: number = count - parsedCurrentCount
      // If we are on the notifications page, we assume the user reads them
      if (window.location.href.includes('notifications')) {
        localStorage.setItem(`${userEmail}/notificationsCount`, (parsedCurrentCount + unreadNotifications).toString())
        unreadNotifications = 0
      }

      setNotificationCount(unreadNotifications)
      // We only want to show the number of notifications if its > 0
      setShowNotificationDot(unreadNotifications > 0)
      blocked = false
    } catch (error) {
      console.error('Error fetching notification count:', error)
    }
  }

  /**
   * Fetch notifications once and then continously fetch more.
   */
  void fetchNotificationCount()
  const notificationFetcher = setInterval(() => {
    if (blocked) return
    void fetchNotificationCount()
  }, 1000)
  onCleanup(() => {
    // When component is unmounted we should destroy the interval
    clearInterval(notificationFetcher)
  })

  return {
    notificationCount,
    showNotificationDot
  }
}
