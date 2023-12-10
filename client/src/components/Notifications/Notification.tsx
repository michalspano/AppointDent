import { type JSX } from 'solid-js'
import './Notification.css'
import alarmIcon from '../../assets/alarm_icon.svg'
import { type NotificationData } from './types'

interface NotificationProps extends NotificationData {}

// Function to format the timstamp into a localised date and time string value
function formatDateTime (timestamp: number): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  const formatedTimestamp = new Date(timestamp * 1000).toISOString().slice(0, 16)
  return new Date(formatedTimestamp).toLocaleDateString('sv-SE', options)
}

// Define the notification component
export default function Notification (props: NotificationProps): JSX.Element {
  return (
    <div class="bg-white p-4 rounded-md shadow-md mt-6">
      <div class="flex items-center">
        <img class="w-6 h-6 mr-2" src={alarmIcon} alt="Alarm Icon" />
        <span class="text-gray-600 mr-2 date-time">{formatDateTime(props.timestamp)}</span>
      </div>
      <div class="mt-2 whitespace-normal">
        {props.message}
      </div>
    </div>
  )
}
