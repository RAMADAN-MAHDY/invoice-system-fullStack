// حذف عنصر من قاعدة البيانات
exports.deleteItem = async (req, res) => {
  try {
    const item = await require('../models/Item').findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: false, message: 'Item not found', data: null });
    res.status(200).json({ status: true, message: 'Item deleted', data: null });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};
const Item = require('../models/Item');
const exportExcel = require('../utils/exportExcel');

exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json({ status: true, message: 'Items fetched', data: items });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

exports.searchItems = async (req, res) => {
  try {
    const { search: q } = req.query;
    const items = await Item.find({
      $or: [
        { modelNumber: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
      ],
    });
    res.status(200).json({ status: true, message: 'Search results', data: items });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { modelNumber, name, quantity, price, customer } = req.body;
    // console.log(req.body);
    if (!modelNumber || !name || quantity == null || price == null || !customer) {
      return res.status(400).json({ status: false, message: 'Please provide all required fields', data: null });
    }
    const item = await Item.create({ modelNumber, name, quantity, price, customer });
    const fullItem = await Item.findById(item._id); // Fetch the full item with _id
    res.status(201).json({ status: true, message: 'Item added', data: fullItem });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ status: false, message: 'Item not found', data: null });
    res.status(200).json({ status: true, message: 'Item updated', data: item });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

exports.exportToExcel = async (req, res) => {
  try {
    const items = await Item.find();
    const buffer = await exportExcel(items);
    // Save buffer to MongoDB
    const InvoiceFile = require('../models/InvoiceFile');
    const invoiceFile = await InvoiceFile.create({ buffer });
    res.status(200).json({ status: true, message: 'Exported to Excel', data: { id: invoiceFile._id } });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};
// Download Excel file from MongoDB
exports.downloadExcel = async (req, res) => {
  try {
    const InvoiceFile = require('../models/InvoiceFile');
    const file = await InvoiceFile.findById(req.params.id);
    if (!file) return res.status(404).json({ status: false, message: 'File not found', data: null });
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="invoices.xlsx"',
    });
    res.send(file.buffer);
  } catch (error) {
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};
// مصروفات
const Expense = require('../models/Expense');

exports.updateExpense = async (req, res) => {
  try {
    const { description, amount } = req.body;
    const expense = await Expense.findByIdAndUpdate(req.params.id, { description, amount }, { new: true });
    if (!expense) return res.status(404).json({ status: false, message: 'Expense not found', data: null });
    res.status(200).json({ status: true, message: 'Expense updated', data: expense });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ status: false, message: 'Expense not found', data: null });
    res.status(200).json({ status: true, message: 'Expense deleted', data: null });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};
