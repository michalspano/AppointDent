import express, { type Express } from 'express'

const app: Express = express()
app.use(express.json()) // for parsing application/json
const port: string = process.env.PORT ?? '6004'

export { app, port }
