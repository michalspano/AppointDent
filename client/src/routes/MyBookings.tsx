import { type JSX } from 'solid-js/jsx-runtime'
import MyBookings from '../components/MyBookings/MyBookings'
import { Api } from '../utils/api'
import { useNavigate } from '@solidjs/router'
import { createEffect } from 'solid-js'

export default function MyBookingsPage (): JSX.Element {
  const navigate = useNavigate()

  const isPatient = async (): Promise<boolean> => {
    return await Api.get('/sessions/whois', { withCredentials: true })
      .then((result) => {
        if (result.data.type === 'd') {
          return false
        } else if (result.data.type === 'p') {
          return true
        }
        return false
      })
      .catch((error: any) => {
        console.error('Error getting user role', error)
        return false
      })
  }

  createEffect(async () => {
    const authResult = await isPatient()
    if (!authResult) {
      navigate('/calendar', { replace: true })
    }
  })
  return <>
    <div class="flex flex-col h-screen w-full">
        <MyBookings/>
    </div >
    </>
}
