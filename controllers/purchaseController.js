const mongoose = require('mongoose');
const Purchase = require('../models/Purchase');
const PurchaseBackup = require('../models/PurchaseBackup');
const AuditLog = require('../models/AuditLog');

exports.list = async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ date: -1 });
    res.status(200).json({ status: true, message: 'Purchases', data: purchases });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

exports.create = async (req, res) => {
  try {
    const { modelNumber, name, quantity, price, supplier, date } = req.body;
    if (!modelNumber || !name || quantity == null || price == null || !supplier) {
      return res.status(400).json({ status: false, message: 'Please provide all required fields', data: null });
    }
    const amount = Number(price) * Number(quantity);
    const doc = await Purchase.create({ description: `شراء ${name} (${modelNumber}) من ${supplier}`, amount, date: date ? new Date(date) : undefined, type: 'purchase', reason: '', itemId: null, modelNumber, name, quantity, price, supplier });
    await AuditLog.create({ userId: req.user?._id, action: 'create', purchaseId: doc._id, changes: doc.toObject() });
    res.status(201).json({ status: true, message: 'Purchase created', data: doc });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ status: false, message: 'Invalid id', data: null });
    const { modelNumber, name, quantity, price, supplier, date } = req.body;
    if (!modelNumber || !name || quantity == null || price == null || !supplier) {
      return res.status(400).json({ status: false, message: 'Please provide all required fields', data: null });
    }
    const amount = Number(price) * Number(quantity);
    const before = await Purchase.findById(id);
    if (!before) return res.status(404).json({ status: false, message: 'Purchase not found', data: null });
    const doc = await Purchase.findByIdAndUpdate(id, { description: `شراء ${name} (${modelNumber}) من ${supplier}`, amount, date: date ? new Date(date) : before.date, type: before.type, reason: before.reason, itemId: before.itemId, modelNumber, name, quantity, price, supplier }, { new: true });
    await AuditLog.create({ userId: req.user?._id, action: 'update', purchaseId: doc._id, changes: { before, after: doc } });
    res.status(200).json({ status: true, message: 'Purchase updated', data: doc });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ status: false, message: 'Invalid id', data: null });
    const doc = await Purchase.findById(id);
    if (!doc) return res.status(404).json({ status: false, message: 'Purchase not found', data: null });
    await PurchaseBackup.create({ ...doc.toObject(), originalId: doc._id });
    await Purchase.findByIdAndDelete(id);
    await AuditLog.create({ userId: req.user?._id, action: 'delete', purchaseId: id, changes: { deleted: doc } });
    res.status(200).json({ status: true, message: 'Purchase deleted', data: null });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};
