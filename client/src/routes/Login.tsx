import { type JSX } from 'solid-js/jsx-runtime'
import LoginForm from '../components/LoginForm/LoginForm'
import LoginImage from '../components/LoginImage/LoginImage'

export default function Login (): JSX.Element {
  return <>
    <div class="flex h-screen">
        <LoginImage/>
        <LoginForm/>
    </div >
    </>
}
