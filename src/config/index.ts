import fs from "fs";
import path from "path";

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  dbname: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

interface Config {
  appName: string;
  database: DatabaseConfig;
  PORT: number;
  NODE_ENV: string;
  LOG_LEVEL: string;
  [key: string]: any; // Allow other properties
}

const env = process.env["NODE_ENV"] || "local";
const defaultConfigPath = path.join(__dirname, "default.json");
const envConfigPath = path.join(__dirname, `${env}.json`);

let config: Config = JSON.parse(fs.readFileSync(defaultConfigPath, "utf-8"));

if (fs.existsSync(envConfigPath)) {
  const envConfig = JSON.parse(fs.readFileSync(envConfigPath, "utf-8"));
  // Deep merge, environment-specific config overrides default
  config = { ...config, ...envConfig, database: { ...config.database, ...envConfig.database } };
}

// 添加环境变量支持
config.NODE_ENV = env;
config["LOG_LEVEL"] = process.env["LOG_LEVEL"] || config["LOG_LEVEL"];

export default config;
