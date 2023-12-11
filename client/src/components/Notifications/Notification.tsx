import { type JSX } from 'solid-js'
import './Notification.css'
import alarmIcon from '../../assets/alarm_icon.svg'
import { type NotificationData } from '../../utils/types'

interface NotificationProps extends NotificationData {}

// Function to format the timstamp into a localised date and time string value
function formatDateTime (timestamp: number): string {
  const date: Date = new Date(timestamp * 1000)
  return date.toLocaleDateString() + ' ' + (date.toLocaleTimeString())
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
