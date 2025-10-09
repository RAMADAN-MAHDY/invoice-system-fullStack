
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');

dotenv.config({ path: './.env' });
connectDB();
const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.JWT_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


// Mount frontend (web) routes
app.use('/', require('./routes/webRoutes'));

// Main API routes
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));

// Global error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ status: false, message: err.message || 'Server Error', data: null });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
