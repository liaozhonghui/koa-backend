const Koa = require("koa");
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import json from "koa-json";
import appConfig from "./config"; // Import the new config
import Database from "./singleton/database"; // Import database
import { HealthCheckData, ApiResponse, ResponseCodes } from "./types";
import { logger as appLogger } from "./singleton/logger";

// Import middleware
import { httpLogger, securityLogger, responseTime } from "./middleware";

// Import filters
import { errorFilter, notFoundFilter } from "./filter";

// Import routes
import userRoutes from "./routes/users";
import apiRoutes from "./routes/api";
import authRoutes from "./routes/auth";

const app = new Koa();
const router = new Router();

// Apply filters first (error handling)
app.use(errorFilter());

// Apply middleware
app.use(httpLogger());
app.use(securityLogger());
app.use(responseTime());
app.use(cors(appConfig.cors));
app.use(json(appConfig.json));
app.use(bodyParser(appConfig.bodyParser));

// Health check endpoint
router.get("/", async (ctx: any) => {
  appLogger.app.info('Health check requested', { 
    requestId: (ctx as any).requestId 
  });
    // Get database connection status
  const database = Database.getInstance();
  const dbStatus = database.getConnectionStatus();
  
  const healthData: HealthCheckData = {
    message: "Koa Backend API is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    database: {
      connected: dbStatus.connected,
      host: appConfig.database.host,
      dbname: appConfig.database.dbname,
      reconnectAttempts: dbStatus.reconnectAttempts,
      status: dbStatus.connected 
        ? 'healthy' 
        : dbStatus.reconnectAttempts > 0 
          ? `reconnecting (${dbStatus.reconnectAttempts}/${dbStatus.maxReconnectAttempts})` 
          : 'disconnected'
    }
  };

  const response: ApiResponse<HealthCheckData> = {
    code: ResponseCodes.SUCCESS,
    msg: 'Health check completed successfully',
    data: healthData
  };

  ctx.body = response;
});

// Route middleware
app.use(router.routes());
app.use(router.allowedMethods());
app.use(userRoutes.routes());
app.use(userRoutes.allowedMethods());
app.use(apiRoutes.routes());
app.use(apiRoutes.allowedMethods());
app.use(authRoutes.routes());
app.use(authRoutes.allowedMethods());

// Apply 404 filter last (after all routes)
app.use(notFoundFilter());

const PORT = appConfig.PORT; // Use port from config

// Initialize database connection
const database = Database.getInstance();

// Only start the server if this file is run directly
if (require.main === module) {
  // Test database connection before starting server
  database.testConnection().then((connected) => {
    if (connected) {
      app.listen(PORT, () => {
        appLogger.app.info('Server started successfully', {
          port: PORT,
          environment: appConfig.NODE_ENV,
          healthCheck: `http://localhost:${PORT}/`,
          database: {
            host: appConfig.database.host,
            port: appConfig.database.port,
            dbname: appConfig.database.dbname
          }
        });
      });
    } else {
      appLogger.app.fatal('Failed to connect to database. Server not started.');
      process.exit(1);
    }
  }).catch((error) => {
    appLogger.app.fatal('Database connection error during startup', error);
    process.exit(1);
  });
}

export default app;
