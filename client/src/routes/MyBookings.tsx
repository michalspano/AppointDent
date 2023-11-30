import { type JSX } from 'solid-js/jsx-runtime'
import MyBookings from '../components/MyBookings/MyBookings'
import { Api } from '../utils/api'
import { useNavigate } from '@solidjs/router'
import { createEffect } from 'solid-js'
import { UserType, type WhoisResponse } from '../utils/types'

export default function MyBookingsPage (): JSX.Element {
  const navigate = useNavigate()

  const isPatient = async (): Promise<boolean> => {
    try {
      const response: WhoisResponse = await Api.get('/sessions/whois', { withCredentials: true })
      if (response.type === UserType.Patient) {
        return true
      } else {
        return false
      }
    } catch (error: any) {
      console.error('Error getting user role', error)
      return false
    }
  }

  createEffect(async () => {
    const authResult: boolean = await isPatient()
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
