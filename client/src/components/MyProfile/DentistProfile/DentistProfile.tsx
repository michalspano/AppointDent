// import { type JSX } from 'solid-js/jsx-runtime'
import logo from '../../../assets/logo.png'
import { type Dentist } from '../../../utils/types'
import { createStore } from 'solid-js/store'
import type { JSX } from 'solid-js'

export default function DentistProfile (dentistProp: Dentist): JSX.Element {
  const [dentist, setDentist] = createStore<Dentist>(dentistProp)
  return <>
    <div class="h-full w-full bg-white flex flex-col items-center justify-center">
      <div class="lg:w-3/4 w-5/6 flex flex-col text-black rounded-sm bg-gradient-to-b from-neutral ... lg:px-10 px-5 py-3 text-sm font-medium">
        <div class="flex items-center justify-center">
          <img class="w-40 " src={logo} alt="AppointDent" />
          <h1 class="mb-2 mt-4 text-lg">{dentist.name.firstName} Profile</h1>
          <input
          class="input h-12 px-3 py-2 mb-3 border rounded-xl"
          type="text"
          placeholder={dentist.userEmail}
          onChange={(event) => { setDentist('userEmail', event.target.value) }}
          />
          <div class="flex flex-row">
            <input
              class="input h-12 w-full px-3 py-2 mb-3 md:mb-0 mr-2 border rounded-xl"
              type="text"
              placeholder={dentist.name.firstName}
              onChange={(event) => { setDentist('name', 'firstName', event.target.value) }}
            />
            <input
              class="input h-12 w-full px-3 py-2 mb-3 border rounded-xl"
              type="text"
              placeholder={dentist.name.lastName}
              onChange={(event) => { setDentist('name', 'lastName', event.target.value) }}
            />
                      </div>
          <label class="block pl-2 text-xs font-extralight pb-1">
                Address of the clinic
          </label>
          <div class="flex flex-row">
            <input
              class="input h-12 w-full px-3 py-2 mb-3  mr-2  border rounded-xl"
              type="text"
              placeholder={dentist.address.city}
              onChange={(event) => { setDentist('address', 'city', event.target.value) }}
            />
            <input
              class="input h-12 w-full px-3 py-2 mb-3  border rounded-xl"
              type="text"
              placeholder={dentist.address.street}
              onChange={(event) => { setDentist('address', 'street', event.target.value) }}
            />
          </div>
          <div class="flex flex-row">
            <input
              class="input h-12 w-full px-3 py-2 mb-3  mr-2  border rounded-xl"
              type="text"
              placeholder={dentist.address.houseNumber}
              onChange={(event) => { setDentist('address', 'houseNumber', event.target.value) }}
            />
            <input
              class="input h-12 w-full px-3 py-2 mb-3  border rounded-xl"
              type="number"
              placeholder={String(dentist.address.zip)}
              onChange={(event) => { setDentist('address', 'zip', Number(event.target.value)) }}
            />
          </div>
        </div>
      </div>
    </div>
  </>
}
