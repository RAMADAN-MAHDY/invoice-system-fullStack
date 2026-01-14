const express = require('express');
const router = express.Router();
const protect = require('../middleware/protectMiddleware');
const authorize = require('../middleware/authorize');
const { list, create, update, remove } = require('../controllers/purchaseController');

router.get('/', protect, list);
router.post('/', protect, authorize('admin', 'editor'), create);
router.put('/:id', protect, authorize('admin', 'editor'), update);
router.delete('/:id', protect, authorize('admin'), remove);

module.exports = router;
