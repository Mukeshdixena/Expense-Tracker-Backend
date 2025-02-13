const express = require('express');
const expenseController = require('../controllers/expenseControllers.js');
const userAuth = require('../middleware/auth.js');

const router = express.Router();

router.get('/api/getExpense', userAuth.authonticate, expenseController.getExpense);
router.post('/api/postExpense', expenseController.postExpense);
router.delete('/api/deleteExpense/:expenseId', expenseController.deleteExpense);
router.patch('/api/editExpense/:editId', expenseController.editExpense);

module.exports = router;
