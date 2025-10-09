const express = require('express');
const router = express.Router();
const protect = require('../middleware/protectMiddleware');
const { addSaleInvoice, getSaleInvoices } = require('../controllers/saleController');

router.post('/', addSaleInvoice);
router.get('/', getSaleInvoices);

module.exports = router;
