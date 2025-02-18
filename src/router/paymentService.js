const express = require('express');
const cashfreeService = require('../service/cashfreeService');
// const userAuth = require('../middleware/auth.js');

const router = express.Router();

router.get('/service/createOrder', cashfreeService.createOrder);
router.get('/payment/paymentStatus/:orderId', cashfreeService.paymentStatus);
// router.get('/service/orderId', cashfreeService.orderId);
// router.post('/api/postExpense', userAuth.authonticate, cashfreeService.postExpense);
// router.delete('/api/deleteExpense/:expenseId', userAuth.authonticate, cashfreeService.deleteExpense);
// router.patch('/api/editExpense/:editId', userAuth.authonticate, cashfreeService.editExpense);

module.exports = router;
