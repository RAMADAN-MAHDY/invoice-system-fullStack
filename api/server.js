const express = require('express');
const serverless = require('serverless-http');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('../config/db');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

// اتصال بقاعدة البيانات
connectDB();

const app = express();

// إعدادات أساسية
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// جلسات المستخدمين
app.use(session({
  secret: process.env.JWT_SECRET || 'default_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 24 * 60 * 60, // يوم كامل
  }),
  cookie: {
    secure: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// إعداد EJS و static
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));
app.set('trust proxy', 1);

// المسارات
app.use('/', require('../routes/webRoutes'));
app.use('/api/items', require('../routes/itemRoutes'));
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/sales', require('../routes/saleRoutes'));

// معالجة الأخطاء
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ status: false, message: 'Internal Server Error' });
});

// ✅ التصدير بالطريقة الصحيحة لـ Vercel
module.exports = app;
module.exports.handler = serverless(app);
