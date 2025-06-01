import fs from "fs";
import path from "path";

interface Config {
  appName: string;
  database: {
    host: string;
    port: number;
  };
  PORT: number;
  logLevel: string;
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

export default config;
