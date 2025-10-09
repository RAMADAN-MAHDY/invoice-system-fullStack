const express = require('express');
const serverless = require('serverless-http');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('../config/db');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

connectDB();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 24*60*60
  }),
  cookie: {
    secure: true,       // HTTPS
    sameSite: 'none',
    maxAge: 24*60*60*1000
  }
}));

// إعداد الـ EJS وملفات الـ Public
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));
app.set('trust proxy', 1); // مهم على Vercel

// ربط Routes
app.use('/', require('../routes/webRoutes'));
app.use('/api/items', require('../routes/itemRoutes'));
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/sales', require('../routes/saleRoutes'));

// تصدير الـ Handler لـ Vercel
module.exports.handler = serverless(app);
