const Item = require('../models/Item');
const SaleInvoice = require('../models/SaleInvoice');
const Expense = require('../models/Expense');

exports.getProfitSummary = async (req, res) => {
    try {
        const purchases = await Item.find().sort({ createdAt: -1 }).limit(50);
        const totalPurchases = await Item.aggregate([
            { $group: { _id: null, total: { $sum: { $multiply: ["$price", "$quantity"] } } } }
        ]);

        const totalSales = await SaleInvoice.aggregate([
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]);

        const expenses = await Expense.find().sort({ date: -1 });
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        const netProfit = (totalSales[0]?.total || 0) - (totalPurchases[0]?.total || 0) - totalExpenses;

        res.render('profit', {
            purchases,
            totalPurchases: totalPurchases[0]?.total || 0,
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