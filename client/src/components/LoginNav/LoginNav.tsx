import { type JSX } from 'solid-js/jsx-runtime'
import { A } from '@solidjs/router'

export default function LoginNav (): JSX.Element {
  return <>
  <div class="flex flex-row justify-end pt-5">
    <A class="mr-3" href="/"> Log in</A>
    <A class="mr-10" href="/signup"> Sign up</A>

      </div>
    </>
}
