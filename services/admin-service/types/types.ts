/**
 * types/types.ts
 *
 * @description :: Custom types for the admin service.
 * @version     :: 1.0
 */

/**
 * Input format for an analytics request.
 */
export interface AnalyticsData {
  id: string
  timestamp: number
  method: string
  path: string
  clientHash: string
  [key: string]: string | number | undefined
}

/**
 * Interval is the identifier of a particular time series group
 * Count is the number of users/requests
 */
export interface AnalyticsResponse {
  interval: string
  count: number
}
