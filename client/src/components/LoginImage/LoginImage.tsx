import { type JSX } from 'solid-js/jsx-runtime'
import home from '../../assets/home.png'
import { useLocation, Link } from '@solidjs/router'
import arrow from '../../assets/arrow-left.png'

export default function LoginImage (): JSX.Element {
  const location = useLocation()

  // Check if the current route is /dentist-signup or /patient-signup
  const isSignupRoute = location.pathname === '/dentist-signup' || location.pathname === '/patient-signup'

  return <>
      <div class="h-full w-full bg-primary md:block hidden">
      {isSignupRoute && (
          <div class="absolute top-4 left-4">
            <Link href="/signup">
           <img class="w-10 " src={arrow} alt="Arrow left" />
           </Link>
          </div>)}
          <div class="flex flex-col justify-center items-center h-full">
            <img class="h-auto w-2/3 mx-auto hidden lg:block" src={home} alt="AppointDent" />
          </div>
        </div>
    </>
}
