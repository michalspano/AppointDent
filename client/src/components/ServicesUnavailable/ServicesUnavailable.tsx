import { type JSX } from 'solid-js/jsx-runtime'
import './ServicesUnavailable.css'
import { createEffect, createSignal } from 'solid-js'
import ServicesUnavailableModal from './ServicesUnavailableModal'
import { Api } from '../../utils/api'

const servicesErr = async (): Promise<string[]> => {
  const response = await Api.get('/heartbeat', { withCredentials: true })
  return response.data
}

createEffect(async () => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setInterval(async () => {
    setErrServices(await servicesErr())
  }, 5000)
})

const [errServices, setErrServices] = createSignal<string[]>([])
const [showList, setShowList] = createSignal<boolean>(false)
export default function ServicesUnavailable (): JSX.Element {
  return <>
  <div class='servicesContainer flex flex-col rounded p-2 mr-8 cursor-pointer items-center lg:flex-row' onClick={() => setShowList(true)}>
    <div class='mr-1 text-white'>🚨 Some services are unavailable</div>
        <strong class='seeMoreText'>...see more</strong>
        {showList() &&
        <ServicesUnavailableModal
        onCancel={() => {
          setShowList(false)
        }}
        services={errServices()}
        />
        }
    </div>
  </>
}
