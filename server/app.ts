import { config } from 'dotenv'
import express, { type Express, type Request, type Response } from 'express'
import spawnServices from './scripts/spawn_services'
import fs, { type Stats } from 'fs'
import { mqttClient } from './mqtt/mqtt'
config() // init dotenv environment

const TOPICS = ['HEARTBEAT']
const parsedServices: string[] = []
const app: Express = express()
app.use(express.json()) // for parsing application/json

const port: string = process.env.PORT ?? '3000'
const servicesPath: string = process.env.SERVICES_PATH ?? '../services'

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from AppointDent!')
})

async function parseService (service: string, servicesPath: string): Promise<void> {
  await new Promise<void>((resolve) => {
    const assumedService: string = servicesPath + '/' + service
    fs.lstat(assumedService, (err: NodeJS.ErrnoException | null, stats: Stats) => {
      if (err != null) throw Error(err.message)
      if (stats.isDirectory()) {
        parsedServices.push(service)
      }
      resolve()
    })
  })
}

async function parseServices (): Promise<void> {
  await new Promise<void>((resolve) => {
    fs.readdir(servicesPath, (_err: NodeJS.ErrnoException | null, services: string[]) => {
      const parseRequests = services.map(async service => { await parseService(service, servicesPath) })
      Promise.allSettled(parseRequests).then((results) => {
        results.forEach((result, index) => {
          if (result.status === 'rejected') throw Error(`Parsing ${services[index]} failed`)
        })
        resolve()
      }).catch((err) => {
        console.error(err)
      })
    })
  })
}

async function setupServices (): Promise<void> {
  await parseServices()
  await spawnServices(servicesPath, parsedServices)
}

app.listen(port, () => {
  console.log('Hello from AppointDent!')
  console.log(`Server is running at http://localhost:${port}`)
  void setupServices()
  void mqttClient.setup(parsedServices, TOPICS)
})
