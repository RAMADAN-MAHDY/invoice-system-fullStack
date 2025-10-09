const express = require('express');
const Item = require('../models/Item');
const requireLogin = require('../middleware/requireLogin');
const SaleInvoice = require('../models/SaleInvoice');
const exportExcel = require('../utils/exportExcel');
const router = express.Router();

// تصدير فواتير المبيعات إلى إكسل حسب الفترة
router.get('/sales/export', requireLogin, async (req, res) => {
    try {
        const { from, to } = req.query;
        let query = {};
        if (from && to) {
            const start = new Date(from);
            const end = new Date(to);
            end.setDate(end.getDate() + 1); // تشمل اليوم الأخير
            query.createdAt = { $gte: start, $lt: end };
        } else if (from) {
            query.createdAt = { $gte: new Date(from) };
        } else if (to) {
            query.createdAt = { $lte: new Date(to) };
        }
        const sales = await SaleInvoice.find(query);
        // تجهيز البيانات للتصدير
        const data = sales.map(sale => ({
            رقم_الفاتورة: sale._id.toString(), // تحويل الـ ObjectId إلى String
            التاريخ: sale.createdAt ? sale.createdAt.toISOString().slice(0, 10) : '',
            المنتج: sale.name,
            الكمية: sale.quantity,
            السعر: sale.price,
            الإجمالي: sale.total
        }));
        const buffer = exportExcel(data, 'فواتير المبيعات');
        res.setHeader('Content-Disposition', 'attachment; filename="sales.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (err) {
        res.status(500).send('خطأ في تصدير الفواتير');
    }
});
// صفحة تعديل فاتورة بيع
router.get('/sales/edit/:id', requireLogin, async (req, res) => {
    try {
        const sale = await SaleInvoice.findById(req.params.id).populate('item');
        if (!sale) return res.status(404).send('فاتورة غير موجودة');
        res.render('editSale', {
            sale: {
                ...sale.toObject(),
                itemName: sale.item ? sale.item.name : ''
            }
        });
    } catch {
        res.status(500).send('خطأ في جلب الفاتورة');
    }
});

// تنفيذ تعديل فاتورة بيع
router.post('/sales/edit/:id', requireLogin, async (req, res) => {
    try {
        const { quantity, price } = req.body;
        const sale = await SaleInvoice.findById(req.params.id);
        if (!sale) return res.status(404).send('فاتورة غير موجودة');
        sale.quantity = quantity;
        sale.price = price;
        sale.total = quantity * price;
        await sale.save();
        res.redirect('/sales');
    } catch {
        res.status(500).send('خطأ في تعديل الفاتورة');
    }
});

// حذف فاتورة بيع
router.post('/sales/delete/:id', requireLogin, async (req, res) => {
    try {
        await SaleInvoice.findByIdAndDelete(req.params.id);
        res.redirect('/sales');
    } catch {
        res.status(500).send('خطأ في حذف الفاتورة');
    }
});

// Root route: redirect to dashboard or login
router.get('/', (req, res) => {
    if (req.session && req.session.loggedIn) {
        return res.redirect('/dashboard');
    }
    res.redirect('/login');
});

// Login page
router.get('/login', (req, res) => res.render('login', { error: null }));

// Login handler
// Login handler: authenticate against API and store JWT
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const axios = require('axios');
        const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
        const response = await axios.post(`${apiUrl}/api/auth/login`, { username, password });
        if (response.data.status && response.data.data.token) {
            req.session.loggedIn = true;
            req.session.token = response.data.data.token;
            return res.redirect('/dashboard');
        }
        res.render('login', { error: response.data.message || 'Invalid credentials' });
    } catch (err) {
        res.render('login', { error: 'Invalid credentials' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

// Dashboard
// Pass JWT token to dashboard for frontend fetch
router.get('/dashboard', requireLogin, async (req, res) => {
    try {
        const invoices = await Item.find().sort({ createdAt: -1 }).limit(10);
        res.render('dashboard', { invoices, token: req.session.token });
    } catch {
        res.render('dashboard', { invoices: [], token: req.session.token });
    }
});

// عرض فواتير المبيعات مع فلترة التاريخ
router.get('/sales', async (req, res) => {
    try {
        const { from, to } = req.query;
        let query = {};
        if (from && to) {
            const start = new Date(from);
            const end = new Date(to);
            end.setDate(end.getDate() + 1); // تشمل اليوم الأخير
            query.createdAt = { $gte: start, $lt: end };
        }
        else if (from) {
            query.createdAt = { $gte: new Date(from) };
        } else if (to) {
            query.createdAt = { $lte: new Date(to) };
        }

        const sales = await SaleInvoice.find(query);
        const salesWithNames = sales.map(sale => ({
            ...sale.toObject(),
            itemName: sale.item ? sale.item.name : ''
        }));

        res.render('sales', {
            sales: salesWithNames,
            token: req.session.token,
            error: null,
            from: req.query.from || '',  // هنا
            to: req.query.to || ''       // هنا
        });
    } catch (err) {
        console.error(err);
        res.render('sales', {
            sales: [],
            token: req.session.token,
            error: 'حدث خطأ أثناء جلب الفواتير',
            from: req.query.from || '',
            to: req.query.to || ''
        });
    }
});


 // عرض ملفات الإكسل المحفوظة
router.get('/excel-files', requireLogin, async (req, res) => {
    try {
        const InvoiceFile = require('../models/InvoiceFile');
        const files = await InvoiceFile.find().sort({ createdAt: -1 });
        res.render('excelFiles', { files, token: req.session.token });
    } catch (err) {
        console.error(err);
        res.status(500).send('خطأ في جلب ملفات الإكسل');
    }
});

// حذف ملف إكسل
router.post('/excel-files/delete/:id', requireLogin, async (req, res) => {
    try {
        const InvoiceFile = require('../models/InvoiceFile');
        await InvoiceFile.findByIdAndDelete(req.params.id);
        res.redirect('/excel-files');
    } catch (err) {
        console.error(err);
        res.status(500).send('خطأ في حذف ملف الإكسل');
    }
});

module.exports = router;