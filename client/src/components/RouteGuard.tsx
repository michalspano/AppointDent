import { type JSX } from 'solid-js/jsx-runtime'
import { Outlet, useNavigate } from '@solidjs/router'
import { createEffect } from 'solid-js'
import { Api } from '../utils/api'
import Navbar from './Navbar/Navbar'

export default function RouteGuard (): JSX.Element {
  const navigate = useNavigate()

  const isAuth = async (): Promise<boolean> => {
    return await Api.get('/sessions/whois', { withCredentials: true })
      .then((result) => {
        if (result.data.message === 'Not logged in') {
          return false
        } else if (
          Boolean(result.data) &&
          typeof result.data.email === 'string' &&
          typeof result.data.type === 'string'
        ) {
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
    const authResult = await isAuth()
    if (!authResult) {
      navigate('/', { replace: true })
      setTimeout(() => { alert('Please log in before using the app.') }, 100)
    }
  })

  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  )
}
