const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload')
const protect = require('../middlewares/authMiddleware');

const { 
    createUser,
    getUsers,
    getUserById,
    updateUser,
    verifyEmail,
    deleteUser,
    loginUser
} = require('../controllers/userController')

router.get('/user', protect, getUsers)
router.get('/user/:id', protect, getUserById)
router.get('/user/verify/:token', verifyEmail)
router.post('/user', upload.single('profilePic'), createUser)
router.put('/user/:id', protect, upload.single('profilePic'), updateUser)
router.post('/user/login', loginUser)
router.delete('/user/:id', protect, deleteUser)

module.exports = router