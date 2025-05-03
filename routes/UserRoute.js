const express = require("express");
const {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    ChangePassword,
    getRoleCounts,
    getUserByEmail
} = require("../controllers/Users.js");
const { verifyUser, adminOnly } = require("../middleware/AuthUser.js");

const router = express.Router();

router.get('/users', verifyUser, getUsers);
router.get('/users/:id', verifyUser, getUserById);
router.post('/users', verifyUser, createUser);
router.patch('/users/:id', verifyUser, updateUser);
router.delete('/users/:id', verifyUser, deleteUser);
router.get('/user/:email',  getUserByEmail);
router.post('/changePassword', verifyUser, ChangePassword);
router.get('/roleCounts', verifyUser, getRoleCounts); // New route for getting role counts

module.exports = router;
