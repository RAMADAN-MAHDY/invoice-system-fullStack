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
    const { modelNumber, name, quantity, price } = req.body;
    const item = await Item.create({ modelNumber, name, quantity, price });
    res.status(201).json({ status: true, message: 'Item added', data: item });
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
