import { onMount, type JSX, createEffect } from 'solid-js'
import Chart from 'chart.js/auto'
import { type ChartData, type ChartType } from '../../utils/types'
import { getChartData } from './graphData'
export function Graph (props: ChartType): JSX.Element {
  let chartInstance: Chart
  let chartRef: HTMLCanvasElement

  const chartLabel: string = 'System usage'

  onMount(() => {
    createEffect(async () => {
      const chartData: ChartData = await getChartData(props.type, props.timeframe)

      if (chartInstance !== undefined) { chartInstance.destroy() }
      chartInstance = new Chart(chartRef, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: chartLabel,
            data: chartData.data,
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    })
  })

  return <>
<div class="w-full">
<canvas ref={canvasEl => { chartRef = canvasEl }} id="chart"></canvas>
</div>
    </>
}
