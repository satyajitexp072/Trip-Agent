import { config } from '../config/env.js';

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};
