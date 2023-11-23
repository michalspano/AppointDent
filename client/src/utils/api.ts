import axios from 'axios'

export const Api = axios.create({
  baseURL: 'http://localhost:3000/api/v1'
})
