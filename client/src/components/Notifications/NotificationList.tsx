import { For, type JSX } from 'solid-js'
import Notification from './Notification'
import { type NotificationData } from './types'

const NotificationsList = (props: { notifications: NotificationData[] }): JSX.Element => (
  <div class="w-full flex flex-col align-left px-10 pr-10">
    <For each={props.notifications} fallback={<div>No notifications available</div>}>
      {(notification) => (
        <Notification {...notification} />
      )}
    </For>
  </div>
)

export default NotificationsList
