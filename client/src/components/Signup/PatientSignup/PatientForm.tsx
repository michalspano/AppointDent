import { type JSX } from 'solid-js/jsx-runtime'
import logo from '../../../assets/logo.png'
import { A } from '@solidjs/router'
import { createSignal } from 'solid-js'
import { Api } from '../../../utils/api'

export default function PatientForm (): JSX.Element {
  const today = new Date().toISOString().split('T')[0]
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [dateOfBirth, setDateOfBirth] = createSignal('')
  const [firstName, setFirstName] = createSignal('')
  const [lastName, setLastName] = createSignal('')
  const [error, setError] = createSignal<string | null>(null)
  /* const fields = [
    userEmail,
    userPassword,
    userFirstName,
    userLastName,
    userBirthday
  ] */

  const signup = (): void => {
    const requiredFields = [email(), password(), firstName(), lastName(), dateOfBirth()]

    if (requiredFields.some((field) => field === '')) {
      setError('Please fill in all fields.')
      return
    }

    Api
      .post('/patients/register', requiredFields)

      .catch((error: any) => {
        console.error('Error during sign up', error)
      })

    setError(null)
  }

  return <>
  <div class="h-full w-full bg-white flex flex-col items-center justify-center">
  <div class="lg:w-3/4  w-5/6 flex flex-col text-black rounded-sm bg-gradient-to-b from-neutral ... lg:px-10 px-5 py-3 text-sm font-medium">
            <div class="flex items-center justify-center">
                <img class="w-40 " src={logo} alt="AppointDent" />
            </div>
            <h1 class="mb-2 mt-4 text-lg">Create a patient account</h1>
            <p class="mb-6 font-extralight">Welcome to AppointDent! Sign up as a patient. </p>
          <input
          class="input h-12 px-3 py-2 mb-3 border rounded-xl"
          type="text"
          placeholder="Email"
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          class="input h-12 px-3 py-2 mb-3 border rounded-xl"
          type="password"
          placeholder="Password"
          onChange={(event) => setPassword(event.target.value)}
        />
          <div class="flex flex-row">
            <input
              class="input h-12 w-full px-3 py-2 mb-3 md:mb-0 mr-2 border rounded-xl"
              type="text"
              placeholder="First name"
              onChange={(event) => setFirstName(event.target.value)}
            />
            <input
              class="input h-12 w-full px-3 py-2 mb-3 border rounded-xl"
              type="text"
              placeholder="Last name"
              onChange={(event) => setLastName(event.target.value)}
            />
          </div>
          <input
              class="input h-12 w-full px-3 py-2 mb-6 border rounded-xl"
              type="date"
              max={today}
              placeholder="Date of birth"
              onChange={(event) => setDateOfBirth(event.target.value)}
            />
        {error() !== null && <p class="text-error">{error()}</p>}
        <button type="submit" class="log-in-btn h-12 mb-6 bg-secondary rounded-xl text-base" onclick={signup} >
            Create account
            </button>
        <p class="font-extralight">Already have an account?
        <span class="font-medium">
        <A class='text-black' href="/"> Log in.</A>
            </span>
          </p>
        </div>
      </div>
    </>
}
