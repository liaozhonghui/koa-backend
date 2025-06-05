// Test setup file
// This file runs before all tests

// import path from "path";
// import { config } from 'dotenv';
// import config from "../src/config";

// Load environment variables from .env.test file
// config({ path: path.resolve(__dirname, '.env.test') });

// Set test environment to test mode - this will automatically use test config
// which includes LOG_LEVEL: "silent" to disable web logs during testing
process.env["NODE_ENV"] = "test";

// Global test setup
beforeAll(() => {
  // Setup that runs before all tests
  console.log("🧪 Test environment initialized (web logs disabled via config)");
});

afterAll(() => {
  // Cleanup that runs after all tests
  console.log("🧹 Test environment cleaned up");
});

// Increase timeout for integration tests
jest.setTimeout(10000);
