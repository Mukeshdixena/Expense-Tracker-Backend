const express = require('express');
const expenseController = require('../controllers/expenseControllers.js');

const router = express.Router();

router.get('/api/getExpense', expenseController.getExpense);
router.post('/api/postExpense', expenseController.postExpense);
router.delete('/api/deleteExpense', expenseController.deleteExpense);

module.exports = router;
