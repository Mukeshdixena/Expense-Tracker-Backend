const express = require('express');
const userController = require('../controllers/userControllers.js');
const userAuth = require('../middleware/auth.js');


const router = express.Router();

router.get('/api/getUser', userController.getUser);
router.get('/api/getLeaderBoad', userController.getLeaderBoad);
router.get('/api/getUserById', userAuth.authonticate, userController.getUserById);
router.get('/api/getUserTotalAmount', userAuth.authonticate, userController.getUserTotalAmount);
router.post('/api/postUser', userController.postUser);
router.patch('/api/postUserPass', userController.postUserPass);
router.delete('/api/deleteUser/:UserId', userController.deleteUser);
router.patch('/api/editUser/:editId', userController.editUser);
router.patch('/api/postPremium', userAuth.authonticate, userController.postPremium);
router.post('/api/signin', userController.signin);

module.exports = router;
