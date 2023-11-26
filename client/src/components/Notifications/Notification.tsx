import { type JSX } from 'solid-js'
import './Notification.css'
import alarmIcon from '../../assets/alarm_icon.svg'
import { type NotificationData } from './types'

interface NotificationProps extends NotificationData {}

function formatDateTime (dateTime: string): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  return new Date(dateTime).toLocaleString(undefined, options)
}

export default function Notification (props: NotificationProps): JSX.Element {
  return (
    <div class="text-base text-left mb-5 ml-2">
      <img class="w-6 h-6 mr-2" src={alarmIcon} alt="Alarm Icon" />
      <span class="mr-2">{formatDateTime(props.date)}</span>
      <div style={{ background: 'none' }}>{props.message}</div>
      <div class="border-line"></div>
    </div>
  )
}
