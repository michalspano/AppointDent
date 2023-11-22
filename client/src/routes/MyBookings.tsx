import { type JSX } from 'solid-js/jsx-runtime'
import MyBookings from '../components/MyBookings/MyBookings'

export default function MyBookingsPage (): JSX.Element {
  return <>
    <div class="flex flex-col h-screen w-full">
        <MyBookings/>
    </div >
    </>
}
