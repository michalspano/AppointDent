import { type JSX } from 'solid-js/jsx-runtime'
import home from '../../assets/home.png'

export default function LoginImage (): JSX.Element {
  return <>
      <div class="w-1/2 bg-primary lg:block sm:hidden">
          <div class="flex flex-col justify-center items-center h-full">
            <img class="h-auto w-2/3 mx-auto" src={home} alt="AppointDent" />
          </div>
        </div>
    </>
}
