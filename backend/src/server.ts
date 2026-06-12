import app from './app';
import { env } from './config/env';

const PORT = env.PORT || '5000';

const server = app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` MedLeave Portal Backend running in ${env.NODE_ENV} mode`);
  console.log(` Server listening at http://localhost:${PORT}`);
  console.log(`===================================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
