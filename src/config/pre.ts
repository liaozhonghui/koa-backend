export const preConfig = {
  database: {
    host: "192.168.191.148",
    port: 5432,
    user: "postgres",
    password: "123456",
    dbname: "node-db-pre",
    max: 15,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  },
  PORT: 8080,
  LOG_LEVEL: "info",
  NODE_ENV: "pre"
} as const;
