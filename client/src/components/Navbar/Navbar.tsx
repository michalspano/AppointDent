import { type JSX } from 'solid-js/jsx-runtime'
import './Navbar.css'
import logo from '../../assets/logo.png'
import { For, Show } from 'solid-js'
import { patientRoutes } from './routes'
import { fadeIn, fadeOut, hamburger, notify, slideIn, slideOut, toggleHamburger, toggleNotification } from './animation'
import location from '../../assets/location.png'

const isUserDentist = false // should be extended with getting current user entity when we have it on BE
const routes = isUserDentist ? null : patientRoutes
const logoLink = isUserDentist ? '/calendar' : '/map'

export default function Navbar (): JSX.Element {
  return <>
    <nav class="bg-primary text-white zAbove">
        <div class="mx-auto px-2 sm:px-6 lg:px-8">
            <div class="relative flex h-16 items-center justify-between">
            <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <button onClick={toggleHamburger} type="button" class="hamburger relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none" aria-controls="mobile-menu" aria-expanded="false">
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
                <a href={logoLink} class="flex flex-shrink-0 items-center">
                    <img class="h-8 w-auto" src={logo} alt="AppointDent" />
                </a>
                <div class="hidden sm:ml-6 sm:block">
                <div class="flex space-x-4">
                    <For each={routes}>{(route, index) =>
                        <div class="flex row">
                            <a href={route.href} class="rounded-md px-3 py-2 text-sm font-medium">{route.name}</a>
                            {route.name === 'Explore' && <img class="w-6 h-6 mt-1" src={location} alt="Arrow left" />}
                            {index() === 0 && <div class='border-l h-auto ml-5 bg-white' style="color: white;"/>}
                        </div>
                    }</For>
                </div>
                </div>
            </div>
            <div class="relative ml-3">
                <div>
                    <button type="button" class="relative flex rounded-full bg-gray-800 text-sm focus:outline-none" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
                    <span class="sr-only">Open user menu</span>
                    <a href="/user-profile">
                        <img class="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt=""></img>
                    </a>
                    </button>
                </div>

                </div>
            <div class="flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <button onClick={toggleNotification} type="button" class="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none">
                <span class="absolute -inset-1.5"></span>
                <span class="sr-only">View notifications</span>
                <svg class="h-6 w-6 notification" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                </button>
                <div class="inset-y-0 right-0 absolute top-10">
                    <Show when={notify()}>
                        <div class={ fadeIn() ? 'notification fade-in-element' : fadeOut() ? 'notification fade-out-element' : 'notification' }>
                            <div class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabindex="-1">
                                <p class="block px-4 py-2 text-sm text-primary">No notifications!</p>
                            </div>
                        </div>
                    </Show>
                </div>
            </div>
            </div>
        </div>

    </nav>
    <Show when={hamburger()}>
        <div class={ slideIn() ? 'slide-in-element bg-primary zUnder' : slideOut() ? 'slide-out-element bg-primary zUnder' : 'bg-primary zUnder' }>
            <div id="">
                <div class="space-y-1 px-2 pb-3 pt-2">
                <For each={routes}>{(route) =>
                        <a href={route.href} class="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium">{route.name}</a>

                    }</For>
                </div>
            </div>
        </div>
        </Show>
    </>
}
