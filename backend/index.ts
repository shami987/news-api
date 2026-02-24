// Main application entry point
import express from 'express'; // Express web framework
import dotenv from 'dotenv'; // Load environment variables
import authRoutes from './src/routes/auth'; // Authentication routes
import articleRoutes from './src/routes/articles'; // Article routes

// Load environment variables from .env file
dotenv.config();

// Create Express application
const app = express();
const PORT = process.env.PORT || 3000; // Use PORT from .env or default to 3000

// Middleware to parse JSON request bodies
app.use(express.json());

// Mount route handlers
app.use('/api/auth', authRoutes); // All auth routes start with /api/auth
app.use('/api/articles', articleRoutes); // All article routes start with /api/articles

// Health check endpoint to verify server is running
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
