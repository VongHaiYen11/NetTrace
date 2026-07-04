import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { config } from './configs/database.config.js';
import { swaggerSpec } from './configs/swagger.config.js';
import alarmRoutes from './routes/alarm.routes.js';
import templateRoutes from './routes/template.routes.js';
import presetRoutes from './routes/preset.routes.js';
import { loggingMiddleware } from './middlewares/logging.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();
const defaultDevOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const allowedOrigins =
  config.cors.allowedOrigins.length > 0 ? config.cors.allowedOrigins : defaultDevOrigins;

// 1. Pino logging middleware (instruments execution duration and metrics)
app.use(loggingMiddleware);

// 2. CORS middleware for browser-based frontend clients
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// 3. Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. API Swagger documentation UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 5. API Endpoints
app.use('/api/v1', alarmRoutes);
app.use('/api/v1/templates', templateRoutes);
app.use('/api/v1/presets', presetRoutes);

// 6. Catch-all for unhandled routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    },
  });
});

// 7. Global error handler (handles validation and db timeout HTTP translations)
app.use(errorMiddleware);

export default app;
