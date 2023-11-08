import { type JSX } from 'solid-js/jsx-runtime'
import home from '../../assets/home.png'
import './Login.css'
import logo from '../../assets/logo.png'

export default function Navbar (): JSX.Element {
  return <>
    <div class="flex h-screen">
      <div class="w-1/2 bg-primary flex flex-col items-center justify-center">
      <img class="h-auto w-2/3" src={home} alt="AppointDent"></img>
      </div>
      <div class="w-1/2 bg-white flex flex-col items-center justify-center">
        <div class="w-2/3 flex flex-col text-black bg-gradient-to-b from-neutral ... px-10 py-10 text-sm font-medium">
            <div class="flex items-center justify-center">
                <img class="w-40 " src={logo} alt="AppointDent" />
            </div>
            <h1 class="mb-4 mt-10 text-lg">Log in</h1>
            <p class="mb-10 font-extralight">Hello, welcome back to your account!</p>
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
        <button type="submit" class="log-in-btn h-12 mb-10 bg-secondary relative rounded-xl text-base" >
            Log in
            </button>
        <p class="font-extralight">Not registered yet?
        <span class="font-medium"> Create an account.</span> </p>
        </div>
      </div>
    </div>
    </>
}
