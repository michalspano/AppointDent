import { type JSX } from 'solid-js/jsx-runtime'
import './LoginForm.css'
import logo from '../../assets/logo.png'
import { A } from '@solidjs/router'

export default function LoginForm (): JSX.Element {
  return <>
  <div class="h-full w-full bg-white flex flex-col items-center justify-center">
        <div class="lg:w-3/4 w-3/4 flex flex-col text-black rounded-sm bg-gradient-to-b from-neutral ... px-10 py-10 text-sm font-medium">
            <div class="flex items-center justify-center">
                <img class="w-40 " src={logo} alt="AppointDent" />
            </div>
            <h1 class="mb-4 mt-10 text-lg">Log in</h1>
            <p class="mb-10 font-extralight">Hello, welcome back to AppointDent!</p>
          <input
          class="input h-12 px-3 py-2 mb-5 border rounded-xl"
          type="text"
          placeholder="Email"
        />
        <input
          class="input h-12 px-3 py-2 mb-8 border rounded-xl"
          type="password"
          placeholder="Password"
        />
        <button type="submit" class="log-in-btn h-12 mb-10 bg-secondary rounded-xl text-base" >
            Log in
            </button>
        <p class="font-extralight">Not registered yet?
        <span class="font-medium">
        <A href="/signup"> Create an account.</A>
            </span>
          </p>
        </div>
      </div>
    </>
}
