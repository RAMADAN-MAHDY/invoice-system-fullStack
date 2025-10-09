const express = require('express');
const router = express.Router();
const protect = require('../middleware/protectMiddleware');
const {
  getAllItems,
  searchItems,
  addItem,
  updateItem,
  exportToExcel,
  downloadExcel,
  deleteItem
} = require('../controllers/itemController');

router.get('/', protect, getAllItems);
router.get('/search', protect, searchItems);
router.post('/', protect, addItem);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);
router.get('/export', protect, exportToExcel);
router.get('/download/:id', protect, downloadExcel);

module.exports = router;
