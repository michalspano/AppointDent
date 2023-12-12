import { For } from 'solid-js'
import './ServicesUnavailable.css'
import { type JSX } from 'solid-js/jsx-runtime'
import type { ServicesUnavailableModalProps } from '../../utils/types'

const transformString = (input: string): string => {
  const words = input.split('-')
  return words.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

export default function ServicesUnavailableModal (props: ServicesUnavailableModalProps): JSX.Element {
  return (
    <div class="fixed inset-0 flex items-center justify-center z-50 text-black bg-transparent-black">
      <div class="bg-white p-10 rounded-lg shadow-xl text-black w-96">
        <p>We're facing technical issues, and the following services are temporarily unavailable:</p>
        <div class='servicesContainer rounded p-6 pt-2 pb-2 mt-4 mb-4 text-white'>
          <For each={props.services}>{(item) =>
              <p class='text-white'>{transformString(item)}</p>
           }
          </For>
        </div>
        <p>Our team is actively working to fix the problem. Thanks for your patience!</p>
        <div class="flex justify-end mt-4">
        <button
            class="bg-secondary px-4 py-2 rounded text-white"
            onClick={props.onCancel}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
