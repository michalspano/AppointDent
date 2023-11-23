// import { type SetStoreFunction } from 'solid-js/store'
import { type JSX } from 'solid-js'
import type { Dentist, Patient } from '../../utils/types'

// Since props can only be objects, there was a need to create this interface
// so that props can be passed to the element function
export interface DentistProfileProps {
  dentistProp: Dentist
}

export interface PatientProfileProps {
  patientProp: Patient
}

export interface CustomInputProps extends JSX.HTMLAttributes<HTMLInputElement> {
  class?: string | undefined
  accept?: string
  value?: string | number
  max?: string
  placeHolder?: string
  inputType: string
  onChange: JSX.ChangeEventHandlerUnion<HTMLInputElement, Event> | undefined
}
