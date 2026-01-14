const Item = require('../models/Item');
const SaleInvoice = require('../models/SaleInvoice');
const Expense = require('../models/Expense');
const Purchase = require('../models/Purchase');

exports.getProfitSummary = async (req, res) => {
    try {
        const purchases = await Purchase.find().sort({ date: -1 }).limit(100);
        const totalPurchasesAgg = await Purchase.aggregate([
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const totalSales = await SaleInvoice.aggregate([
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]);

        const expenses = await Expense.find().sort({ date: -1 });
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        const netProfit = (totalSales[0]?.total || 0) - (totalPurchasesAgg[0]?.total || 0) - totalExpenses;

        res.render('profit', {
            purchases,
            totalPurchases: totalPurchasesAgg[0]?.total || 0,
            totalSales: totalSales[0]?.total || 0,
            netProfit,
            expenses,
            totalExpenses
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('خطأ في جلب البيانات');
    }
};

exports.addPurchaseAdjustment = async (req, res) => {
    try {
        const { amount, reason } = req.body;
        const val = parseFloat(amount);
        if (isNaN(val)) {
            return res.status(400).send('قيمة المبلغ غير صالحة');
        }
        await Purchase.create({
            description: reason || 'تعديل يدوي لإجمالي المشتريات',
            amount: val,
            type: 'adjustment',
            reason: reason || ''
        });
        res.redirect('/profit');
    } catch (error) {
        console.error(error);
        res.status(500).send('خطأ في إضافة التعديل');
    }
};

exports.addPurchaseAdjustmentApi = async (req, res) => {
    try {
        const { amount, reason } = req.body;
        const val = parseFloat(amount);
        if (isNaN(val)) {
            return res.status(400).json({ status: false, message: 'قيمة المبلغ غير صالحة' });
        }
        const doc = await Purchase.create({
            description: reason || 'تعديل يدوي لإجمالي المشتريات',
            amount: val,
            type: 'adjustment',
            reason: reason || ''
        });
        return res.status(201).json({ status: true, message: 'تم إضافة التعديل', data: doc });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'خطأ في إضافة التعديل' });
    }
};

exports.getProfitSummaryJson = async (req, res) => {
    try {
        const purchases = await Purchase.find().sort({ date: -1 }).limit(100);
        const totalPurchasesAgg = await Purchase.aggregate([
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalSales = await SaleInvoice.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]);
        const expenses = await Expense.find().sort({ date: -1 });
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const netProfit = (totalSales[0]?.total || 0) - (totalPurchasesAgg[0]?.total || 0) - totalExpenses;
        res.json({
            status: true,
            data: {
                purchases,
                totalPurchases: totalPurchasesAgg[0]?.total || 0,
                totalSales: totalSales[0]?.total || 0,
                totalExpenses,
                netProfit
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'خطأ في جلب البيانات' });
    }
};
