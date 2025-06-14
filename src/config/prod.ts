export const prodConfig = {
  database: {
    host: "192.168.191.148",
    port: 5432,
    user: "postgres",
    password: "123456",
    dbname: "node-db-prod",
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  },  PORT: 80,
  LOG_LEVEL: "warn",
  NODE_ENV: "prod"
} as const;
