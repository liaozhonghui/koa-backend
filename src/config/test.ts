export const testConfig = {
  NODE_ENV: "test",
  LOG_LEVEL: "silent",
  database: {
    host: "192.168.191.148",
    port: 5432,
    user: "postgres",
    password: "123456",
    dbname: "node-db",
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  cors: {
    origin: "*",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
    ],
  },
  json: {
    pretty: false,
    param: "pretty",
    spaces: 2,
  },
  bodyParser: {
    enableTypes: ["json", "form"],
    jsonLimit: "10mb",
    formLimit: "10mb",
    textLimit: "10mb",
  },
  jwt: {
    secret: "test-jwt-secret-key",
    expiresIn: "1h",
  },
} as const;
