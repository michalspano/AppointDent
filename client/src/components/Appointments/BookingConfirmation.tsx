import { type JSX } from 'solid-js/jsx-runtime'

interface BookingConfirmationProps {
  location: string | undefined
  dentistName: string | undefined
  date: string | undefined
  onConfirm: () => void
  onCancel: () => void
}

export default function BookingConfirmationPopup (props: BookingConfirmationProps): JSX.Element {
  return (
    <div class="fixed inset-0 flex items-center justify-center z-50 text-black bg-transparent-black">
      <div class="bg-white p-10 rounded-lg shadow-xl text-black w-96">
        <p class="mb-4">You are about to book an appointment with <strong>{props.dentistName}</strong>, at the following address: <strong>{props.location}</strong></p>
        <p>The appointment is scheduled for <strong>{props.date}</strong></p>
        <div class="flex justify-end mt-4">
        <button
            class="bg-secondary text-white px-4 py-2 rounded"
            onClick={props.onCancel}
          >
            Cancel
          </button>
          <button
            class="bg-primary text-white px-4 py-2 ml-2 rounded"
            onClick={() => {
              props.onConfirm()
            }}
          >
            Book
          </button>
        </div>
      </div>
    </div>
  )
}
