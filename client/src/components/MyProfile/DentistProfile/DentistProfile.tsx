// import { type JSX } from 'solid-js/jsx-runtime'
import logo from '../../../assets/logo.png'
import { type Dentist } from '../../../utils/types'
import { createStore } from 'solid-js/store'
import { createSignal, type JSX } from 'solid-js'
import axios from 'axios'
import { type AxiosResponse } from 'axios'
import { type DentistProfileProps } from '../MyProfileTypes'
import { isValidDentist } from '../utils'
import CustomInput from '../CustomInput'

export default function DentistProfile (dentistProp: DentistProfileProps): JSX.Element {
  // we need a copy, so that the original values do not change
  // in case a wrong patch is executed, we set the values back to what
  // they were
  const dentistCopy = structuredClone(dentistProp.dentistProp)
  const [dentist, setDentist] = createStore<Dentist>(dentistCopy)
  const [proImage, setProImage] = createSignal<string>(dentist.picture)
  const [getError, setError] = createSignal<Error | null>(null)

  // using blob and FileReader to read an image and render it on the front-end
  const uploadProPic = function (target: HTMLInputElement): void {
    const files = target.files
    if (files !== null && files !== undefined && files.length > 0) {
      console.log(files[0].type)
      const file = files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result
        if (result !== null) {
          if (typeof result === 'string') {
            setProImage(result)
          }
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // The following method will be called upon saving changes
  // You can change it however you see fit when you are integrating with the
  // backend
  const patchDentist = function patchDentist (patchedDentist: Dentist): void {
    const validDentist = isValidDentist(dentist)
    if (validDentist !== undefined) {
      setError(new Error(validDentist))
      setTimeout(() => setError(null), 2000)
      return
    }
    const url = `/dentist/${patchedDentist.userEmail}`
    axios.patch<Dentist, AxiosResponse<Dentist>, Dentist>(url, patchedDentist)
      .then(result => { setDentist(result.data) })
      .catch(err => {
        setError(new Error('Please try again.'))
        setTimeout(() => {
          setError(null)
          setDentist(dentistProp.dentistProp)
          setProImage(dentistProp.dentistProp.picture)
          location.reload()
        }, 3000)
        console.log(err)
      })
  }

  // note that you need to upload a picture to see how it looks like
  return <>
    <div class="h-full w-full bg-white flex lg:flex-row flex-col items-center justify-center">
      <div class='lg:h-full lg:w-1/2 w-full h-1/4 flex flex-col  bg-primary'>
        <div class='flex items-top justify-center'>
        </div>
        <div class='flex items-center justify-center'>
          <img class='lg:w-5/6 w-1/5 h-auto lg:rounded-md rounded-full mb-8' src={proImage()} alt='profile image' />
        </div>
      </div>
      <div class="lg:w-1/2 w-5/6 h-auto lg:mx-8 my-8 justify-center flex flex-col text-black rounded-sm bg-gradient-to-b from-neutral ... lg:px-10 px-5 py-3 text-sm font-medium">
        <div class="flex flex-col items-center justify-center">
          <img class="w-40 " src={logo} alt="AppointDent" />
        </div>
          <h1 class="mb-2 mt-4 text-lg">{dentist.name.firstName}'s Profile</h1>
          <CustomInput value={dentist.userEmail} inputType='text' onChange={(event) => { setDentist('userEmail', event.target.value) }} disabled={true}/>
          <div class="flex flex-row">
            <CustomInput class='mr-2' value={dentist.name.firstName} inputType='text' onChange={(event) => { setDentist('name', 'firstName', event.target.value) }} disabled={false}/>
            <CustomInput value={dentist.name.lastName} inputType='text' onChange={(event) => { setDentist('name', 'lastName', event.target.value) }} disabled={false}/>
          </div>
          <label class="text-black block pl-2 text-xs font-extralight pb-1">
                Address of the clinic
          </label>
          <div class="flex flex-row">
            <CustomInput class='mr-2' value={dentist.address.city} inputType='text' onChange={(event) => { setDentist('address', 'city', event.target.value) }} disabled={false}/>
            <CustomInput value={dentist.address.street} inputType='text' onChange={(event) => { setDentist('address', 'street', event.target.value) }} disabled={false}/>
          </div>
          <div class="flex flex-row">
            <CustomInput class='mr-2' value={dentist.address.houseNumber} inputType='text' onChange={(event) => { setDentist('address', 'houseNumber', event.target.value) }} disabled={false}/>
            <CustomInput value={dentist.address.zip} inputType='number' onChange={(event) => { setDentist('address', 'zip', Number(event.target.value)) }} disabled={false}/>
          </div>
          <CustomInput value='' accept='.jpeg, .jpg, .png' inputType='file' placeHolder='Upload a profile image' onChange={(event) => { uploadProPic(event.target) } } disabled={false}/>
          {getError() !== null ? <p class="text-error">{(getError() as Error).message}</p> : <></>}
          <button type="submit" class="log-in-btn h-12 mb-6 bg-secondary rounded-xl text-base" onClick={() => { patchDentist(dentist) }}>
             Save changes
          </button>
      </div>
    </div>
  </>
}
