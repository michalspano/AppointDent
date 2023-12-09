import { Api } from '../../../utils/api'
import { type AnalyticsResponse, type ChartData } from '../../../utils/types'

/**
 * Used to fetch data from the admin service regarding the system usage
 * @param category Free text search query for request/category of request
 * @param method Free text HTTP method
 * @param loggedInOnly Restrict to only logged in users or not
 * @returns Data from the statistics API
 */
export async function getChartData (category: string, method: string, loggedInOnly: boolean): Promise<ChartData> {
  const labels: string[] = []
  const data: number[] = []
  // At the moment we retrieve only 10 minutes data, later on it can be extended and made customizable
  const rawData: AnalyticsResponse[] = (await Api.get(`/admins/requests?timeframe=600&method=${method}&search=${category}&loggedInOnly=${loggedInOnly}`, { withCredentials: true })).data

  for (let i = 0; i < rawData.length; i++) {
    let timeString: string = ''
    const date: Date = new Date((rawData[i].interval) * 1000)
    const hours: string = ('0' + date.getHours()).slice(-2)
    const minutes: string = ('0' + date.getMinutes()).slice(-2)
    const seconds: string = ('0' + date.getSeconds()).slice(-2)
    timeString = hours + ':' + minutes + ':' + seconds
    labels.push(timeString)
    data.push(rawData[i].count)
  }

  const chartData: ChartData = {
    data,
    labels
  }
  return chartData
}
