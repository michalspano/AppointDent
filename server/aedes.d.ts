declare module 'aedes-persistence-redis' {
  /**
   * The options for the redis connection.
   */
  export interface RedisConnectionOptions { port: number, host: string };

  // The persistence option of Aedes assumes type any, hence any is
  // used here too (as the return type of the function).
  const aedesPersistenceRedis: {
    (options: RedisConnectionOptions): any;
  };

  export default aedesPersistenceRedis;
}