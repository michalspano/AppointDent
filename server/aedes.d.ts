declare module 'aedes-persistence-redis' {
    // You can specify the module's exports here.
    // For example, if it exports a function, you can describe it like this:
    // function myFunction(args: any): any;
   
    export interface RedisConnectionOptions { port: number, host: string };
   
    // The persistence option of Aedes assumes type any, hence any is
    // used here too (as the return type of the function).
    const aedesPersistenceRedis: {
      (options: RedisConnectionOptions): any;
    };
 
    export default aedesPersistenceRedis;
  }