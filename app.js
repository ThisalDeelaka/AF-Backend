const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const goalRoutes = require('./routes/goalRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); 
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');

// Import recurring transactions cron job logic
require('./utils/recurringTransaction');  

// Initialize app
const app = express();


app.use(helmet()); 
app.use(cors());    

// Rate limiting to limit the number of requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});

app.use(limiter);  


app.use(express.json());

// Route handling
app.use('/api', authRoutes);
app.use('/api', transactionRoutes);
app.use('/api', budgetRoutes);
app.use('/api', goalRoutes);
app.use('/api', notificationRoutes);
app.use('/api', adminRoutes);
app.use('/api', userRoutes);


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('DB connected'))
  .catch(err => console.log(err));

module.exports = app;
