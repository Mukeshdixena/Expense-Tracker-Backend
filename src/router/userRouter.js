const express = require('express');
const userController = require('../controllers/userControllers.js');


const router = express.Router();

router.get('/api/getUser', userController.getUser);
router.post('/api/postUser', userController.postUser);
router.delete('/api/deleteUser/:userId', userController.deleteUser);
router.put('/api/editUser/:editId', userController.editUser);
router.post('/api/signin', userController.signin);

module.exports = router;
