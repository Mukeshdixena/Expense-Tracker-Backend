const express = require('express');
const expenseController = require('../controllers/expenseControllers.js');
const userAuth = require('../middleware/auth.js');

const router = express.Router();

router.get('/api/getExpense', userAuth.authonticate, expenseController.getExpense);
router.get('/api/getExpenseFile', userAuth.authonticate, expenseController.getExpenseFile);
router.post('/api/postExpense', userAuth.authonticate, expenseController.postExpense);
router.delete('/api/deleteExpense/:expenseId', userAuth.authonticate, expenseController.deleteExpense);
router.patch('/api/editExpense/:editId', userAuth.authonticate, expenseController.editExpense);

module.exports = router;
