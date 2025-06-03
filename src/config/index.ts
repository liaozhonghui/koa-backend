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

interface CorsConfig {
  origin: string;
  credentials: boolean;
  allowMethods: string[];
  allowHeaders: string[];
}

interface JsonConfig {
  pretty?: boolean;
  param?: string;
  spaces?: number;
}

interface BodyParserConfig {
  enableTypes: string[];
  jsonLimit: string;
  formLimit: string;
  textLimit: string;
}

interface SessionConfig {
  key: string;
  maxAge: number;
  httpOnly: boolean;
  signed: boolean;
}

interface SecurityConfig {
  helmet: boolean;
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

interface Config {
  appName: string;
  cors: CorsConfig;
  json: JsonConfig;
  bodyParser: BodyParserConfig;
  session: SessionConfig;
  security: SecurityConfig;
  database: DatabaseConfig; // Make required after validation
  PORT: number;
  NODE_ENV: string;
  LOG_LEVEL: string;
  [key: string]: any; // Allow other properties
}

const env = process.env["NODE_ENV"] || "local";
const defaultConfigPath = path.join(__dirname, "default.json");
const envConfigPath = path.join(__dirname, `${env}.json`);

// Load common configuration (CORS, JSON, etc.)
let config: any = JSON.parse(fs.readFileSync(defaultConfigPath, "utf-8"));

// Load environment-specific configuration (DB, PORT, LOG_LEVEL, etc.)
if (fs.existsSync(envConfigPath)) {
  const envConfig = JSON.parse(fs.readFileSync(envConfigPath, "utf-8"));
  // Deep merge environment-specific config
  config = { 
    ...config, 
    ...envConfig, 
    database: envConfig.database || config.database
  };
}

// Override with environment variables if present
config.NODE_ENV = process.env["NODE_ENV"] || config.NODE_ENV || env;
config.LOG_LEVEL = process.env["LOG_LEVEL"] || config.LOG_LEVEL || "info";
config.PORT = parseInt(process.env["PORT"] || "") || config.PORT || 3000;

// Ensure required environment-specific configs exist
if (!config.database) {
  throw new Error(`Database configuration not found for environment: ${env}`);
}

// Type assertion after validation
const validatedConfig: Config = config as Config;

export default validatedConfig;
