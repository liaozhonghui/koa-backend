# Koa Backend

A modern REST API backend built with **Koa 3.0.0**, **TypeScript**, and Node.js.

## Features

- ✅ Modern async/await syntax with Koa 3.0.0
- ✅ **TypeScript** for type safety and better development experience
- ✅ RESTful API endpoints
- ✅ CORS support
- ✅ Request logging
- ✅ Error handling middleware
- ✅ JSON body parsing
- ✅ Environment configuration
- ✅ Health check endpoints
- ✅ Type definitions for all API responses

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000` with TypeScript compilation and hot reload.

### 3. Build for Production

```bash
npm run build
```

### 4. Start Production Server

```bash
npm start
```

## API Endpoints

### Health Check

- `GET /` - Basic health check

### API Info

- `GET /api/status` - API status and uptime
- `GET /api/info` - API information and available endpoints
- `POST /api/echo` - Echo endpoint for testing

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Example Requests

### Get all users

```bash
curl http://localhost:3000/api/users
```

### Create a new user

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

### Get API status

```bash
curl http://localhost:3000/api/status
```

## Project Structure

```
koa-backend/
├── src/
│   ├── app.ts          # Main application file
│   ├── types/
│   │   └── index.ts    # TypeScript type definitions
│   └── routes/
│       ├── api.ts      # General API routes
│       └── users.ts    # User-related routes
├── dist/               # Compiled JavaScript (after build)
├── package.json
├── tsconfig.json       # TypeScript configuration
├── jest.config.js      # Jest testing configuration
├── nodemon.json        # Nodemon configuration
├── .env               # Environment variables
└── README.md
```

## Environment Variables

Copy `.env` file and configure:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)

## Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server (requires build first)
- `npm run dev` - Start development server with TypeScript and hot reload
- `npm run dev:watch` - Alternative development command
- `npm test` - Run tests with Jest
- `npm run clean` - Clean build directory

## Technologies Used

- **TypeScript** - Type-safe JavaScript superset
- **Koa 3.0.0** - Web framework
- **koa-router** - Router middleware
- **koa-bodyparser** - Body parsing middleware
- **@koa/cors** - CORS middleware
- **koa-logger** - Logging middleware
- **dotenv** - Environment variable management
- **ts-node** - TypeScript execution for development
- **nodemon** - Development server with hot reload
- **Jest** - Testing framework with TypeScript support

## Next Steps

Consider adding:

- Database integration (MongoDB, PostgreSQL, etc.)
- Authentication & authorization (JWT)
- Input validation (Joi, Yup)
- API documentation (Swagger)
- Unit tests (Jest)
- Rate limiting
- Caching (Redis)
- Docker support
