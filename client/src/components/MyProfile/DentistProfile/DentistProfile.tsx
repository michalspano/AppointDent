// import { type JSX } from 'solid-js/jsx-runtime'
import logo from '../../../assets/logo.png'
import { type Dentist, type Country } from '../../../utils/types'
import { createStore } from 'solid-js/store'
import { createEffect, createSignal, type JSX } from 'solid-js'
import { type AxiosResponse } from 'axios'
import { type DentistProfileProps } from '../MyProfileTypes'
import { isValidName, validateAddress } from '../utils'
import CustomInput from '../CustomInput'
import { Api } from '../../../utils/api'
import * as CountryList from 'country-list'

export default function DentistProfile (dentistProp: DentistProfileProps): JSX.Element {
  const allCountriesNames = CountryList.getNameList()
  const allCountries: Country[] = []
  for (const key in allCountriesNames) {
    allCountries.push({ name: key, code: CountryList.getCode(key) as string })
  }

  const [dentist, setDentist] = createStore<Dentist>(dentistProp.dentistProp)
  const [proImage, setProImage] = createSignal<string>(dentistProp.dentistProp.picture)
  const [getError, setError] = createSignal<Error | null>(null)
  const [dentCountry, setDentCountry] = createSignal<Country | undefined>(allCountries.find((country) => country.code === dentistProp.dentistProp.clinicCountry))

  // const possibleDentCountry: Country | undefined = allCountries.find((country) => country.code === dentist.clinicCountry)
  // const dentCountryName = possibleDentCountry !== undefined ? possibleDentCountry.name : 'Select your country'

  createEffect(async () => {
    setDentist(dentistProp.dentistProp)
    setProImage(dentistProp.dentistProp.picture)
    setDentCountry(allCountries.find((country) => country.code === dentistProp.dentistProp.clinicCountry))
  })

  // using blob and FileReader to read an image and render it on the front-end
  const handleUpload = async (): Promise<string> => {
    const fileInput: HTMLInputElement | null = document.querySelector('input[type=file]')

    if (fileInput != null) {
      if (fileInput.files != null) {
        const file = fileInput?.files[0]
        const reader = new FileReader()
        const baseString = await new Promise<string | ArrayBuffer | null>((resolve) => {
          reader.onloadend = function () {
            resolve(reader.result)
          }
          reader.readAsDataURL(file)
        })
        return baseString as string ?? ''
      }
    }
    throw new Error('File input element not found.')
  }

  const patchDentist = async function patchDentist (patchedDentist: Dentist): Promise<void> {
    // if false is returned, the name is not valid
    const validDentist = isValidName(patchedDentist.firstName, patchedDentist.lastName)
    if (!validDentist) {
      setError(new Error('First name and last name cannot be empty.'))
      setTimeout(() => setError(null), 3000)
      return
    }
    const validAddress = await validateAddress(patchedDentist)
    if (validAddress !== null) {
      setError(new Error(validAddress))
      setTimeout(() => setError(null), 3000)
      return
    }
    const url = `/dentists/${dentistProp.dentistProp.email}`
    await Api.patch<Dentist, AxiosResponse<Dentist>, Dentist>(url, patchedDentist, { withCredentials: true })
      .then(result => {
        const user = result.data
        if (user !== undefined) {
          setDentist(user)
        }
      })
      .catch(err => {
        setDentist(dentistProp.dentistProp)
        setProImage(dentistProp.dentistProp.picture)
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
    <div class="w-full bg-white flex lg:flex-row flex-col items-center justify-center">
      <div class='lg:h-full lg:w-1/2 w-full h-1/4 flex flex-col justify-center items-center'>
          <img class='lg:w-4/6 w-1/2 h-auto lg:rounded-md rounded-md-full m-8 mb-20 lg:mb-0' src={proImage()} alt='profile image' />
      </div>
      <div class="lg:w-1/2 w-5/6 h-auto lg:mx-8 my-8 mb-0 mt-10 justify-center flex flex-col text-black rounded-sm bg-gradient-to-b from-neutral ... lg:px-10 px-5 py-3 text-sm font-medium">
        <div class="flex flex-col items-center justify-center">
          <img class="w-40 " src={logo} alt="AppointDent" />
        </div>
          <h1 class="mb-2 mt-4 text-lg">{dentistProp.dentistProp.firstName}'s Profile</h1>
          <CustomInput value={dentistProp.dentistProp.email} inputType='text' onChange={(event) => { setDentist('email', event.target.value) }} disabled={true}/>
          <div class="flex flex-row">
            <CustomInput class='mr-2' value={dentistProp.dentistProp.firstName} inputType='text' onChange={(event) => { setDentist('firstName', event.target.value) }} disabled={false}/>
            <CustomInput value={dentistProp.dentistProp.lastName} inputType='text' onChange={(event) => { setDentist('lastName', event.target.value) }} disabled={false}/>
          </div>
          <label class="text-black block pl-2 text-xs font-extralight pb-1">
                Address of the clinic
          </label>
          <select
              class="input h-12 w-full px-3 py-2 mb-3  mr-2  border rounded-xl"
              onChange={(event) => { setDentist('clinicCountry', event.target.value) }}
          >
                <option selected disabled hidden value={dentistProp.dentistProp.clinicCountry}>{dentCountry()?.name}</option>
              {
              allCountries.map((country) => (
                <option value={country.code}>{country.name}</option>
              ))
            }
          </select>
          <div class="flex flex-row">
            <CustomInput class='mr-2' value={dentistProp.dentistProp.clinicCity} inputType='text' onChange={(event) => { setDentist('clinicCity', event.target.value) }} disabled={false}/>
            <CustomInput value={dentistProp.dentistProp.clinicStreet} inputType='text' onChange={(event) => { setDentist('clinicStreet', event.target.value) }} disabled={false}/>
          </div>
          <div class="flex flex-row">
            <CustomInput class='mr-2' value={dentistProp.dentistProp.clinicHouseNumber} inputType='text' onChange={(event) => { setDentist('clinicHouseNumber', Number(event.target.value)) }} disabled={false}/>
            <CustomInput value={dentistProp.dentistProp.clinicZipCode} inputType='number' onChange={(event) => { setDentist('clinicZipCode', Number(event.target.value)) }} disabled={false}/>
          </div>
          <label class="text-black block pl-2 text-xs font-extralight pb-1">
                Profile picture
          </label>
          <CustomInput value='' accept='.jpeg, .jpg, .png' inputType='file' placeHolder='Upload a profile image'
        onChange={() => {
          handleUpload().catch((error) => {
            console.error('Error creating account:', error)
          })
        }} disabled={false}/>
          {getError() !== null ? <p class="text-error">{(getError() as Error).message}</p> : <></>}
          <button type="submit" class="log-in-btn h-12 mb-6 bg-secondary rounded-xl text-base text-white" onClick={() => { void patchDentist(dentist) }}>
             Save changes
          </button>
      </div>
    </div>
  </>
}
