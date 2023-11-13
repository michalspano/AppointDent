import { type JSX } from 'solid-js/jsx-runtime'
import { Link, useLocation } from '@solidjs/router'
import { createSignal, onCleanup, createEffect } from 'solid-js'
import './LoginNav.css'

export default function LoginNav (): JSX.Element {
  const location = useLocation()
  const [currentRoute, setCurrentRoute] = createSignal('')

  createEffect(() => {
    setCurrentRoute(location.pathname)
  })

  onCleanup(() => {})

  return <>
  <div class="navbar flex flex-row justify-end pt-5">
  <Link class={`mr-3 ${currentRoute() === '/' ? 'currentpage' : 'not-currentpage'}`} href="/">
         Log in
       </Link>
       <Link class={`mr-10 ${currentRoute() === '/signup' || currentRoute() === '/dentist-signup' || currentRoute() === '/patient-signup' ? 'currentpage' : 'not-currentpage'}`} href="/signup">
          Sign up
        </Link>
      </div>
    </>
}
