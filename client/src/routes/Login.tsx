import { type JSX } from 'solid-js/jsx-runtime'
import LoginForm from '../components/LoginForm/LoginForm'
import LoginImage from '../components/LoginImage/LoginImage'
import LoginNav from '../components/LoginNav/LoginNav'

export default function Login (): JSX.Element {
  return <>
    <div class="flex h-screen w-full">
        <div class="w-1/2 md:block hidden">
            <LoginImage/>
        </div>
        <div class="w-full lg:w-1/2 flex flex-col justify-center">
            <LoginNav/>
            <LoginForm/>
        </div>
    </div >
    </>
}
