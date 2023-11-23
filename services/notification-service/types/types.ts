export interface QueryResult {
  changes: number
  lastInsertRowid: number
}

export interface Notification {
  id: string
  timestamp: number
  message: string
  email: string
}
