import { For } from 'solid-js'
import { type JSX } from 'solid-js/jsx-runtime'

interface ModalProps {
  onCancel: () => void
  services: string[]
}

export default function ServicesUnavailableModal (props: ModalProps): JSX.Element {
  return (
    <div class="fixed inset-0 flex items-center justify-center z-50 text-black bg-transparent-black">
      <div class="bg-white p-10 rounded-lg shadow-xl text-black w-96">
        <p>We're facing technical issues, and the following services are temporarily unavailable:</p>
        <div class='rounded p-6 text-white' style='background-color: rgb(217, 152, 152);'>
          <For each={props.services}>{(item) =>
              <p class='text-white'>{item}</p>
           }
          </For>
          <p class='text-white'>Login Service</p>
          <p class='text-white'>Register Service</p>
        </div>
        <p>Our team is actively working to fix the problem. Thanks for your patience!"</p>
        <div class="flex justify-end mt-4">
        <button
            class="bg-secondary px-4 py-2 rounded"
            onClick={props.onCancel}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
