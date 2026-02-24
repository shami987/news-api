// Main application entry point
import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth';
import articleRoutes from './src/routes/articles';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
