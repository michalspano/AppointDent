import { type JSX } from 'solid-js/jsx-runtime'
import DentistCalendar from '../components/Calendar/Calendar'
import { Api } from '../utils/api'
import { useNavigate } from '@solidjs/router'
import { createEffect } from 'solid-js'

export default function DentistSignup (): JSX.Element {
  const navigate = useNavigate()

  const isDentist = async (): Promise<boolean> => {
    return await Api.get('/sessions/whois', { withCredentials: true })
      .then((result) => {
        if (result.data.type === 'p') {
          return false
        } else if (result.data.type === 'd') {
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
    const authResult = await isDentist()
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
