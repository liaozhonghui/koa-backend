import { defaultConfig } from "./default";
import { localConfig } from "./local";
import { prodConfig } from "./prod";
import { preConfig } from "./pre";
import { testConfig } from "./test";

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
  database: DatabaseConfig;
  PORT: number;
  NODE_ENV: string;
  LOG_LEVEL: string;
  [key: string]: any; // Allow other properties
}

const env = process.env["NODE_ENV"] || "local";

// Environment config mapping
const envConfigs = {
  local: localConfig,
  production: prodConfig,
  "pre-production": preConfig,
  prod: prodConfig,
  pre: preConfig,
  test: testConfig
};

// Get environment-specific config
const envConfig = envConfigs[env as keyof typeof envConfigs] || localConfig;

// Merge default config with environment-specific config
let config: any = {
  ...defaultConfig,
  ...envConfig
};

// Override with environment variables if present
config.NODE_ENV = process.env["NODE_ENV"] || config.NODE_ENV || env;
config.LOG_LEVEL = process.env["LOG_LEVEL"] || config.LOG_LEVEL || "info";
config.PORT = parseInt(process.env["PORT"] || "") || config.PORT || 3000;
// Override JWT configuration with environment variables if provided
config["jwt"] = {
  secret: process.env["JWT_SECRET"] || config["jwt"].secret,
  expiresIn: process.env["JWT_EXPIRES_IN"] || config["jwt"].expiresIn
};

// Ensure required environment-specific configs exist
if (!config.database) {
  throw new Error(`Database configuration not found for environment: ${env}`);
}

// Type assertion after validation
const validatedConfig: Config = config as Config;

export default validatedConfig;
