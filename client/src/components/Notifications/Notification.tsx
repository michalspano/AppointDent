import { type JSX } from 'solid-js'
import './Notification.css'
import alarmIcon from '../../assets/alarm_icon.svg'
import { type NotificationData } from './types'

interface NotificationProps extends NotificationData {
}

export default function Notification (props: NotificationProps): JSX.Element {
  return (
    <div class="notification flex items-center w-full p-4 mx-auto border-b">
      <img class="w-6 h-6 mr-2" src={alarmIcon} alt="Alarm Icon" />
      <span class="mr-2">{props.date}</span>
      <div>{props.message}</div>
    </div>
  )
}
