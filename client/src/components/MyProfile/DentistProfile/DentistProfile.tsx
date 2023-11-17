// import { type JSX } from 'solid-js/jsx-runtime'
import logo from '../../../assets/logo.png'
import { type Dentist } from '../../../utils/types'
import { createStore } from 'solid-js/store'
import { createSignal, type JSX } from 'solid-js'

interface DentistProfileProps {
  dentistProp: Dentist
}

// function isValidDentist (dentist: Dentist): boolean {
//   if (dentist.address.zip <= 0) {
//     return false
//   }
//   // RegEx expression to check email validity
//   // source: https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch04s01.html
//   if (dentist.userEmail.match(/A[A-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[A-Z0-9.-]+Z/) == null) {
//     return false
//   }
//   if (dentist.name.firstName === '' || dentist.name.lastName === '') {
//     return false
//   }
//   return true
// }

export default function DentistProfile (dentistProp: DentistProfileProps): JSX.Element {
  const [dentist, setDentist] = createStore<Dentist>(dentistProp.dentistProp)
  const [proImage, setProImage] = createSignal<string>(dentist.picture)
  console.log(proImage())
  return <>
    <div class="h-full w-full bg-white flex flex-row items-center justify-center">
      <div class='lg:w-1/2 flex flex-col items-center justify-center bg-primary md:block hidden'>
        <img class='w-80 h-80 ' src={proImage()} alt='profile image' />
      </div>
      <div class="lg:w-1/2 w-5/6 flex flex-col text-black rounded-sm bg-gradient-to-b from-neutral ... lg:px-10 px-5 py-3 text-sm font-medium">
        <div class="flex flex-col items-center justify-center">
          <img class="w-40 " src={logo} alt="AppointDent" />
        </div>
          <h1 class="mb-2 mt-4 text-lg">{dentist.name.firstName}'s Profile</h1>
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
          <input
              class="input h-12 w-full px-3 py-2 mb-6  border rounded-xl"
              type="file"
              accept=".jpeg, .jpg, .png"
              placeholder="Upload a profile image"
              onChange={(event) => {
                const files = event.target.files
                console.log(files)
                console.log(typeof files)
                console.log(event.target.type)
                if (files !== null && files !== undefined && files.length > 0) {
                  const file = files[0]
                  const reader = new FileReader()
                  reader.onloadend = () => {
                    const result = reader.result
                    console.log(result)
                    if (result !== null) {
                      if (typeof result === 'string') {
                        setProImage(result)
                        console.log(proImage())
                      }
                    }
                  }
                  reader.readAsDataURL(file)
                }
              }}
            />
      </div>
    </div>
  </>
}
