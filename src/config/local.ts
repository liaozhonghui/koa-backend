export const localConfig = {
  database: {
    host: "192.168.191.148",
    port: 5432,
    user: "postgres",
    password: "123456",
    dbname: "node-db",
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  },
  PORT: 3001,
  LOG_LEVEL: "debug",
  NODE_ENV: "local"
} as const;
