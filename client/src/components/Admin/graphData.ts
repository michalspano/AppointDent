import { Api } from '../../utils/api'
import { type AnalyticsResponse, type ChartData } from '../../utils/types'

export async function getChartData (type: string, timeframe: string): Promise<ChartData> {
  const divisor = 6
  const parsedTf = parseInt(timeframe)

  const startTime = Math.round(Date.now() / 1000)
  const endTime = startTime - (parsedTf)
  const labelsLength = (parsedTf) / divisor
  const parsedData: number[] = []

  for (let i = 0; i < divisor; i++) {
    parsedData[i] = 0
  }
  const labelsAsNumber: number[] = []
  const labels: string[] = []
  for (let i = endTime; i < startTime; i += labelsLength) {
    const time = new Date((i) * 1000)
    let timeString: string = ''
    if (parsedTf < 86400) {
      const hours = ('0' + time.getHours()).slice(-2)
      const minutes = ('0' + time.getMinutes()).slice(-2)
      const seconds = ('0' + time.getSeconds()).slice(-2)
      timeString = hours + ':' + minutes + ':' + seconds
    } else {
      timeString = time.toLocaleDateString()
    }
    labelsAsNumber.push(i)
    labels.push(timeString)
  }

  const rawData: AnalyticsResponse[] = (await Api.get(`/admins/requests?start=${startTime}&end=${endTime}`, { withCredentials: true })).data

  for (let i = 0; i < rawData.length; i++) {
    for (let x = 0; x < labelsAsNumber.length; x++) {
      if (rawData[i].timestamp < labelsAsNumber[x]) {
        if (isNaN(parsedData[i])) {
          parsedData[x] = 1
        } else {
          parsedData[x] += 1
        }
        break
      }
    }
  }

  const chartData: ChartData = {
    data: parsedData,
    labels
  }
  return chartData
}
