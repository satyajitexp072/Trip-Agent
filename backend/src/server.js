import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';

const startServer = async () => {
  // Connect to database (gracefully handles offline DB)
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`========================================`);
    console.log(` Trip-Agent Backend Server Running`);
    console.log(` Product: Trip Agent`);
    console.log(` Port: ${config.port}`);
    console.log(` Env:  ${config.nodeEnv}`);
    console.log(` Health: http://localhost:${config.port}/api/health`);
    console.log(`========================================`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection] ${err.message}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n[Server] Shutting down gracefully...');
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer();
