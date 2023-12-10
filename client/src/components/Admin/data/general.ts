import { Api } from '../../../utils/api'
import { type AnalyticsResponse, type ChartData } from '../../../utils/types'

/**
 *
 * @param timestamp UNIX timestamp
 * @returns returns a time string in format HH:MM:SS
 */
function createTimeString (timestamp: number): string {
  const date: Date = new Date((timestamp) * 1000)
  const hours: string = ('0' + date.getHours()).slice(-2)
  const minutes: string = ('0' + date.getMinutes()).slice(-2)
  const seconds: string = ('0' + date.getSeconds()).slice(-2)
  return hours + ':' + minutes + ':' + seconds
}

/**
 * Used to fetch data from the admin service regarding the system usage
 * @param category Free text search query for request/category of request
 * @param method Free text HTTP method
 * @param loggedInOnly Restrict to only logged in users or not
 * @returns Data from the statistics API
 */
export async function getChartData (category: string, method: string, loggedInOnly: boolean, timeframe: number = 600): Promise<ChartData> {
  const labels: string[] = []
  const data: number[] = []
  // At the moment we retrieve only 10 minutes data, later on it can be extended and made customizable
  const rawData: AnalyticsResponse[] = (await Api.get(`/admins/requests
    ?timeframe=${timeframe}
    &method=${method}
    &search=${category}
    &loggedInOnly=${loggedInOnly}`,
  { withCredentials: true })).data

  for (let i = 0; i < rawData.length; i++) {
    const timeString: string = createTimeString(rawData[i].interval)
    labels.push(timeString)
    data.push(rawData[i].count)
  }

  const chartData: ChartData = {
    data,
    labels
  }
  return chartData
}
