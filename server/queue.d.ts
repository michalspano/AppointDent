declare module 'express-queue' {
    // You can specify the module's exports here.
    // For example, if it exports a function, you can describe it like this:
    // function myFunction(args: any): any;
  
    // If you're unsure of the module's structure, you can use the `any` type
    // to bypass type checking (this is not recommended for production code
    // as it disables type checking for the module).
    const queueMiddleware: any;
  
    export default queueMiddleware;
  }
  