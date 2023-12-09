import { onMount, type JSX, onCleanup } from 'solid-js'
import Chart from 'chart.js/auto'
import { type ChartData, type ChartType } from '../../../utils/types'
import { getChartData } from '../data/general'
export function Graph (props: ChartType): JSX.Element {
  let chartInstance: Chart
  let chartRef: HTMLCanvasElement
  let chartData: ChartData

  /**
   * Used to automatically fetch chart data from analytics endpoint
   */
  const autoFetch = setInterval(() => {
    getChartData(props.category, props.method, props.loggedInOnly).then((result) => {
      chartData = result
      chartInstance.data.datasets = [{ label: '', data: chartData.data, borderWidth: 1 }]
      chartInstance.data.labels = chartData.labels
      chartInstance.update()
    }).catch((err) => {
      console.error(err)
      console.error('Chart data fetching failed!')
    })
  }, 2000)
  onCleanup(() => {
    clearInterval(autoFetch)
  })
  onMount(() => {
    getChartData(props.category, props.method, props.loggedInOnly).then((result) => {
      chartData = result
      chartInstance = new Chart(chartRef, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: '',
            data: chartData.data,
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true // Set y to begin at 0
            }
          },
          animation: {
            duration: 0 // Disable animations
          },
          plugins: {
            legend: {
              display: false // Disable legend
            }
          }
        }
      })
    }).catch((err) => {
      console.error(err)
      console.error('Chart data fetching failed!')
    })
  })
  return <>
<div class="w-full">
<canvas ref={canvasEl => { chartRef = canvasEl }} id="chart"></canvas>
</div>
    </>
}
