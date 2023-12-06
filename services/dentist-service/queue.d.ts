declare module 'express-queue' {
  /**
   * Options for the queue middleware.
   */
  export interface QueueMiddlewareOptions {
    maxQueue: number;
    activeLimit: number;
    // Add other properties if needed
  };

  /**
   * The queue middleware type that is exported by the module.
   * It assumes options of type QueueMiddlewareOptions 
   */
  export type QueueMiddleware<T = any> = (options: QueueMiddlewareOptions) => T;

  const queueMiddleware: QueueMiddleware;

  export default queueMiddleware;
}