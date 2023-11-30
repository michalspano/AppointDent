import { type JSX } from 'solid-js/jsx-runtime'
import DentistCalendar from '../components/Calendar/Calendar'
import { Api } from '../utils/api'
import { useNavigate } from '@solidjs/router'
import { createEffect } from 'solid-js'
import { UserType, type WhoisResponse } from '../utils/types'

export default function DentistSignup (): JSX.Element {
  const navigate = useNavigate()

  const isDentist = async (): Promise<boolean> => {
    try {
      const response: WhoisResponse = await Api.get('/sessions/whois', { withCredentials: true })
      if (response.type === UserType.Dentist) {
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
    const authResult: boolean = await isDentist()
    if (!authResult) {
      navigate('/map', { replace: true })
    }
  })
  return <>
      <div class="flex flex-col h-full w-full">
          <div class="">
          </div>
          <div>
          <DentistCalendar/>
          </div>
      </div >
      </>
}
