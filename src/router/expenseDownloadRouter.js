const express = require('express');
const expenseDownloadController = require('../controllers/expenseDownloadControllers.js');
const userAuth = require('../middleware/auth.js');

const router = express.Router();

router.get('/api/getExpenseDownload', userAuth.authenticate, expenseDownloadController.getExpenseDownload);
router.post('/api/postExpenseDownload', userAuth.authenticate, expenseDownloadController.postExpenseDownload);
router.delete('/api/deleteExpenseDownload/:expenseDownloadId', userAuth.authenticate, expenseDownloadController.deleteExpenseDownload);

module.exports = router;
