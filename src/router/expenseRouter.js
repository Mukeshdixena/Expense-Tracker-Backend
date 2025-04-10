const express = require('express');
const expenseController = require('../controllers/expenseControllers.js');
const userAuth = require('../middleware/auth.js');

const router = express.Router();

router.get('/api/getExpense', userAuth.authenticate, expenseController.getExpense);
router.get('/api/getExpenseFile', userAuth.authenticate, expenseController.getExpenseFile);
router.post('/api/postExpense', userAuth.authenticate, expenseController.postExpense);
router.delete('/api/deleteExpense/:expenseId', userAuth.authenticate, expenseController.deleteExpense);
router.patch('/api/editExpense/:editId', userAuth.authenticate, expenseController.editExpense);

module.exports = router;
