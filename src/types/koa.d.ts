// Koa Context extensions
declare module 'koa' {
  interface DefaultContext {
    requestId: string;
    logger: any;
  }
}
