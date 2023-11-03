import { onMount } from 'solid-js'
import { type JSX } from 'solid-js/jsx-runtime'
import { helloWorld, msg } from '../components/Home/helloWorld'

export default function Home (): JSX.Element {
  onMount(() => {
    helloWorld().then(() => {
      console.log('Executed hello world successfully!')
    }).catch(() => {
      console.error('Hello world failed!')
    })
  })

  return <>
  <h1 class="text-3xl font-bold underline">
    {msg}
  </h1>

      </>
}
