import { type JSX } from 'solid-js/jsx-runtime'
import './Navbar.css'
import logo from '../../assets/logo.png'
import { For, createEffect, createSignal, onCleanup } from 'solid-js'
import { patientRoutes } from './routes'
import location from '../../assets/location.png'
import { Api } from '../../utils/api'
import profile from '../../assets/profile.png'
import ServicesUnavailable from '../ServicesUnavailable/ServicesUnavailable'
import { useNotification } from './NotificationCounter'
import { type WhoisResponse } from '../../utils/types'

export default function Navbar (): JSX.Element {
  const { notificationCount, showNotificationDot } = useNotification()

  const user = async (): Promise<WhoisResponse> => {
    try {
      const response = await Api.get('sessions/whois', { withCredentials: true })
      return response.data
    } catch (error) {
      console.error(error)
      const fallbackValue: WhoisResponse = {
        status: 0,
        email: undefined,
        type: undefined
      }
      return fallbackValue
    }
  }

  const logout = async (): Promise<void> => {
    const endpoints = ['/dentists/logout', '/patients/logout', '/admins/logout']

    for (const endpoint of endpoints) {
      try {
        await Api.delete(endpoint, { withCredentials: true })
        window.location.replace('/')
        return // If logout is successful, exit the function
      } catch (error) {
        console.error(`Error during logout from ${endpoint}`, error)
      }
    }
  }

  /**
   * Update the notification count in local storage
   * and then redirect the user to the notification
   * page.
   */
  function showNotifications (): void {
    user().then((result: WhoisResponse) => { // Retrieve the user type
      // Before redirecting user, update the notification count.
      const previousCount: string | null = (localStorage.getItem(`${result.email}/notificationsCount`))
      localStorage.setItem(`${result.email}/notificationsCount`, (parseInt(previousCount ?? '0') + notificationCount()).toString())
      // Take them to notification page.
      window.location.replace('/notifications')
    }).catch((err: Error) => {
      console.error(err)
    })
  }

  /**
   * setLogoLink is used to define where user will be redirected
   * upon clicking the app logo in the navbar, route is specific to the user type
  **/
  createEffect(async () => {
    const type = (await user()).type?.toString() as string
    if (type === undefined) {
      alert('The system has encountered a problem')
      window.location.replace('/')
      return
    }
    setType(type)
    try {
      switch (type) {
        case 'd':
          setLogoLink('/calendar')
          break

        case 'p':
          setRoutes(patientRoutes) // Navbar for patients should contain multiple links and they are passed as props `patientRoutes`
          setLogoLink('/map')
          break

        case 'a':
          setLogoLink('/admin-page')
          break

        default:
          break
      }
    } catch (error) {
      console.error(error)
    }
  })

  onCleanup(() => { })

  const [routes, setRoutes] = createSignal<any[]>()
  const [logoLink, setLogoLink] = createSignal<string>('')
  const [type, setType] = createSignal<string>('')

  return <>
  <nav class="bg-primary text-white zAbove">
        <div class="mx-auto px-2 sm:px-6 lg:px-8">
            <div class="relative flex h-16 items-center justify-between">
            <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <button onClick={showNotifications} type="button" class="hamburger relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none" aria-controls="mobile-menu" aria-expanded="false">
                <span class="absolute -inset-0.5"></span>
                <span class="sr-only">Open main menu</span>

                <svg class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>

                <svg class="hidden h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
            </div>
            <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <a href={logoLink()} class="flex flex-shrink-0 items-center">
                    <img class="h-8 w-auto" src={logo} alt="AppointDent" />
                </a>
                <div class="hidden md:ml-6 ml-2 sm:block">
                <div class="flex ">
                    <For each={routes()}>{(route, index) =>
                        <div class="flex row">
                            <a href={route.href} class="rounded-md px-2 md:px-3 py-2 text-sm font-medium">{route.name}</a>
                            {route.name === 'Explore' && <img class="w-6 h-6 mt-1" src={location} alt="Arrow left" />}
                            {index() === 0 && <div class='border-l h-auto ml-2 lg:ml-5 bg-white' style="color: white;"/>}
                        </div>
                    }</For>
                </div>
                </div>
            </div>
            <ServicesUnavailable />
                <div class="flex items-center sm:static sm:inset-auto ">
                <button onClick={() => { showNotifications() }} type="button" class="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none">
                    <span class="absolute -inset-1.5"></span>
                    <span class="sr-only">View notifications</span>
                    <svg class="h-6 w-6 notification" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    {showNotificationDot() && (
                  <div class="absolute top-1 right-0 -mt-2">
                  <div class="bg-error text-white w-4 h-4 flex items-center justify-center rounded-md text-xs font-semibold ml-2">
                      {notificationCount()}
                  </div>
              </div>
                    )}
                </button>
        </div>
        <div class="relative ml-2 md:ml-4">
                <div>
                    <button type="button" class="relative flex rounded-full bg-gray-800 text-sm focus:outline-none" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
                    <span class="sr-only">Open user menu</span>
                    {type() !== 'a' &&
                    <a href="/user-profile">
                        <img class="h-8 w-8 rounded-full" src={profile} alt=""></img>
                    </a>
                    }
                    </button>
                </div>

                </div>
            <div class='ml-2 md:ml-4'>
                <button onclick={() => {
                  logout()
                    .catch((error) => {
                      console.error('Error logging out:', error)
                    })
                }}>Log out</button>
            </div>
            </div>

                    </div>

            </nav>

            </>
}
