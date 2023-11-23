import { type JSX } from 'solid-js/jsx-runtime'
import './Calendar.css'

interface ConfirmationPopupProps {
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmationPopup (props: ConfirmationPopupProps): JSX.Element {
  return (
    <div class="fixed inset-0 flex items-center justify-center z-50 text-white">
      <div class="bg-primary p-10 rounded-lg text-white shadow-xl">
        <p class="delete-text mb-4">
            Do you want to delete this event?</p>
        <div class="flex justify-end">
        <button
            class="bg-secondary px-4 py-2 rounded"
            onClick={props.onCancel}
          >
            No
          </button>
          <button
            class="bg-error text-white px-4 py-2 ml-2 rounded"
            onClick={() => {
              props.onConfirm()
            }}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  )
}
