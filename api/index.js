import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to MealMate API',
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});

// Example route for a future endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Export the app for Vercel Serverless
export default app;
