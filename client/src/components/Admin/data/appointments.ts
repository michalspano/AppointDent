import { Api } from '../../../utils/api'
import { type AvailableAppointmentsCount } from '../../../utils/types'

/**
 *
 * @returns number of available appointments
 */
export async function getAvailableAppointments (): Promise<number> {
  const data = await Api.get('/appointments/admins/count?onlyAvailable=true', { withCredentials: true })
  return (data.data as AvailableAppointmentsCount).count
}
