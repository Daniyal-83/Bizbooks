// server.js
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
let morgan;

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// connect DB
connectDB();

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV !== 'production') {
  morgan = require('morgan');
  app.use(morgan('dev'));
}

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true // allow cookies
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 404 for unknown API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'Not found' });
  }
  next();
});

// global error handler (simple)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
