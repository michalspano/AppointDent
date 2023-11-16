import { type JSX } from 'solid-js/jsx-runtime'
import './LoginForm.css'
import logo from '../../assets/logo.png'
import { A } from '@solidjs/router'
import { createSignal } from 'solid-js'

export default function LoginForm (): JSX.Element {
  const [userEmail, setUserEmail] = createSignal('')
  const [userPassword, setUserPassword] = createSignal('')
  const [error, setError] = createSignal<string | null>(null)

  const login = async (): Promise<void> => {
    if (userEmail() === '' || userPassword() === '') {
      setError('Please fill in all fields.')
      return
    }
    // console.log(userEmail())
    // console.log(userPassword())
    // setError(null)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userEmail(),
          password: userPassword()
        })
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Login successful:', data)
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.message)
      }
    } catch (error) {
      console.error('Error during login:', error)
      setError('An unexpected error occurred.')
    }
  }

  return <>
  <div class="h-full w-full bg-white flex flex-col items-center justify-center">
        <div class="lg:w-3/4 w-5/6 flex flex-col text-black rounded-sm bg-gradient-to-b from-neutral ... px-10 py-10 text-sm font-medium">
            <div class="flex items-center justify-center">
                <img class="w-40 " src={logo} alt="AppointDent" />
            </div>
            <h1 class="mb-4 mt-10 text-lg">Log in</h1>
            <p class="mb-10 font-extralight">Hello, welcome back to AppointDent!</p>
          <input
          class="input h-12 px-3 py-2 mb-5 border rounded-xl"
          type="text"
          placeholder="Email"
          onChange={(event) => setUserEmail(event.target.value)}
          />
        <input
          class="input h-12 px-3 py-2 mb-8 border rounded-xl"
          type="password"
          placeholder="Password"
          onChange={(event) => setUserPassword(event.target.value)}
        />
        {error() !== null && <p class="text-error">{error()}</p>}
        <button type="submit" class="log-in-btn h-12 mb-10 bg-secondary rounded-xl text-base"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={async () => {
          try {
            await login()
          } catch (error) {
            console.error('Login failed:', error)
          }
        }}>
            Log in
            </button>
        <p class="font-extralight">Not registered yet?
        <span class="font-medium">
        <A href="/signup"> Create an account.</A>
            </span>
          </p>
        </div>
      </div>
    </>
}
