import { type JSX } from 'solid-js/jsx-runtime'
import './ServicesUnavailable.css'
import { createEffect, createSignal } from 'solid-js'
import ServicesUnavailableModal from './ServicesUnavailableModal'
import { Api } from '../../utils/api'

const servicesErr = async (): Promise<void> => {
  const response = await Api.get('/heartbeat', { withCredentials: true })
  const killedServices = getKilledServicesNames(response.data.data)
  setErrServices(killedServices)
}

function getKilledServicesNames (statusObject: object): string[] {
  return Object.entries(statusObject)
    .filter(([_, status]: [string, boolean]) => !status)
    .map(([serviceName]) => serviceName)
}

createEffect(() => {
  setInterval(() => {
    servicesErr()
      .catch((error) => {
        console.error(error)
      })
  }, 5000)
})

const [errServices, setErrServices] = createSignal<string[]>([])
const [showList, setShowList] = createSignal<boolean>(false)
export default function ServicesUnavailable (): JSX.Element {
  return <> {
    errServices().length > 0 &&
    <>
    <div class='servicesContainer flex flex-col rounded p-2 mr-8 cursor-pointer items-center lg:flex-row' onClick={() => setShowList(true)}>
    <div class='text-white text-xs lg:mr-1 md:text-base'>🚨 Some services are unavailable</div>
        <strong class='seeMoreText text-xs md:text-base'>...see more</strong>
    </div>
    {showList() &&
        <ServicesUnavailableModal
        onCancel={() => {
          setShowList(false)
        }}
        services={errServices()}
        />
        }
    </>
  }

  </>
}
