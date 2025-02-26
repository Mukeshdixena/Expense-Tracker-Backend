const express = require('express');
const expenseDownloadController = require('../controllers/expenseDownloadControllers.js');
const userAuth = require('../middleware/auth.js');

const router = express.Router();

router.get('/api/getExpenseDownload', userAuth.authonticate, expenseDownloadController.getExpenseDownload);
router.post('/api/postExpenseDownload', userAuth.authonticate, expenseDownloadController.postExpenseDownload);
router.delete('/api/deleteExpenseDownload/:expenseDownloadId', userAuth.authonticate, expenseDownloadController.deleteExpenseDownload);

module.exports = router;
