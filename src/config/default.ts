export const defaultConfig = {
  appName: "Koa Backend API",
  cors: {
    origin: "*",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"]
  },
  json: {
    pretty: false,
    param: "pretty",
    spaces: 2
  },
  bodyParser: {
    enableTypes: ["json", "form"],
    jsonLimit: "10mb",
    formLimit: "10mb",
    textLimit: "10mb"
  },
  session: {
    key: "koa.sess",
    maxAge: 86400000,
    httpOnly: true,
    signed: true
  },
  security: {
    helmet: true,
    rateLimit: {
      windowMs: 900000,
      max: 100
    }
  }
} as const;
