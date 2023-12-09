import { Api } from '../../../utils/api'
import { type AnalyticsResponse, type ChartData } from '../../../utils/types'

export async function getChartData (type: string, method: string, loggedInOnly: boolean): Promise<ChartData> {
  const labels: string[] = []
  const data: number[] = []
  const rawData: AnalyticsResponse[] = (await Api.get(`/admins/requests?timeframe=600&method=${method}&search=${type}&loggedInOnly=${loggedInOnly}`, { withCredentials: true })).data

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
