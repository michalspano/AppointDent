/**
 * types/types.ts
 *
 * @description :: Custom types for the admin service.
 * @version     :: 1.0
 */

export interface AnalyticsData {
  id: string
  timestamp: number
  method: string
  path: string
  agent: string
  clientHash: string
  [key: string]: string | number | undefined

}
