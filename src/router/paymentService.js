const express = require('express');
const cashfreeService = require('../service/cashfreeService');

const router = express.Router();

router.get('/service/createOrder', cashfreeService.createOrder);//
router.get('/payment/paymentStatus/:orderId', cashfreeService.paymentStatus);//
router.post('/forgetPassword/postOtpMail', cashfreeService.postOtpMail);//
router.post('/forgetPassword/verifyOtp', cashfreeService.verifyOtp);//

module.exports = router;
