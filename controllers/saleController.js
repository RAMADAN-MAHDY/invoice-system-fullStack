const SaleInvoice = require('../models/SaleInvoice');
const Item = require('../models/Item');

exports.addSaleInvoice = async (req, res) => {
  try {
    const { modelNumber, name, quantity, price } = req.body;
    const item = await Item.findOne({ modelNumber });
    if (!item) return res.status(404).json({ status: false, message: 'المنتج غير موجود', data: null });
    if (item.quantity < quantity) return res.status(400).json({ status: false, message: 'الكمية غير متوفرة', data: null });
    item.quantity -= quantity;
    await item.save();
    const total = quantity * price;
    const invoice = await SaleInvoice.create({ modelNumber, name, quantity, price, total });
    res.status(201).json({ status: true, message: 'تم إضافة فاتورة البيع', data: invoice });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

exports.getSaleInvoices = async (req, res) => {
  try {
    const { day, month, year, from, to } = req.query;
    let filter = {};

    if (day) {
      // فواتير اليوم المحدد
      const start = new Date(day);
      const end = new Date(day);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    } 
    else if (month) {
      // فواتير الشهر المحدد
      const [y, m] = month.split('-');
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 1);
      filter.createdAt = { $gte: start, $lt: end };
    } 
    else if (year) {
      // فواتير السنة المحددة
      const start = new Date(year, 0, 1);
      const end = new Date(Number(year) + 1, 0, 1);
      filter.createdAt = { $gte: start, $lt: end };
    } 
 else if (from || to) {
  const start = from ? new Date(from) : new Date('1970-01-01'); // لو from مش موجود يبدأ من 1970
  const end = to ? new Date(to) : new Date(); // لو to مش موجود يستخدم التاريخ الحالي
  end.setDate(end.getDate() + 1); // لضمان شمول اليوم الأخير
  filter.createdAt = { $gte: start, $lt: end };
}


    const invoices = await SaleInvoice.find(filter).sort({ createdAt: -1 }).limit(100);

    console.log('Applied Filter:', invoices); // سجل الفلتر المستخدم

    res.status(200).json({
      status: true,
      message: 'فواتير البيع',
      data: invoices
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null
    });
  }
};
