import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import logger from "koa-logger";
import json from "koa-json";
import appConfig from "./config"; // Import the new config
import { HealthCheckResponse, ApiError } from "./types";

// Import routes
import userRoutes from "./routes/users";
import apiRoutes from "./routes/api";

const app = new Koa();
const router = new Router();

// Middleware
app.use(logger());
app.use(cors());
app.use(json());
app.use(bodyParser());

// Error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err: any) {
    const error: ApiError = {
      message: err.message || "Internal Server Error",
      status: err.status || 500,
    };

    ctx.status = error.status;
    ctx.body = {
      error: {
        message: error.message,
        status: error.status,
      },
    };
    console.error("Error:", err);
  }
});

// Health check endpoint
router.get("/", async (ctx) => {
  const response: HealthCheckResponse = {
    message: "Koa Backend API is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
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

const PORT = appConfig.PORT; // Use port from config

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/`);
  });
}

export default app;
