const express = require('express');
const router = express.Router();
const protect = require('../middleware/protectMiddleware');
const { addSaleInvoice, getSaleInvoices, updateSaleInvoice, deleteSaleInvoice, bulkDeleteSaleInvoices } = require('../controllers/saleController');

router.post('/', addSaleInvoice);
router.get('/', getSaleInvoices);
router.put('/:id', updateSaleInvoice);
router.delete('/:id', deleteSaleInvoice);
router.post('/bulk-delete', bulkDeleteSaleInvoices);

module.exports = router;
