import { type JSX } from 'solid-js'
import { type CustomInputProps } from './MyProfileTypes'

export default function CustomInput (customInputProps: CustomInputProps): JSX.Element {
  const stylingClass = `input h-12 w-full px-3 py-2 mb-3 border rounded-xl ${customInputProps.class}`
  return <>
    <input
      class={stylingClass}
      accept={customInputProps.accept}
      type={customInputProps.inputType}
      value={customInputProps.value}
      placeholder={customInputProps.placeHolder}
      onChange={customInputProps.onChange}
    />
  </>
}
