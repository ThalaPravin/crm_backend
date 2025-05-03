const express = require("express");
const {
    getVendors,
    getVendorById,
    createVendor,
    updateVendor,
    deleteVendor,
    getRoleCounts
} = require("../controllers/VendorController.js");
const { verifyUser } = require("../middleware/AuthUser.js");

const router = express.Router();

router.get('/vendors',verifyUser,  getVendors);
router.get('/vendor/:id', verifyUser, getVendorById);
router.post('/vendor', createVendor);
router.patch('/vendor/:id', verifyUser, updateVendor);
router.delete('/vendor/:id', verifyUser, deleteVendor);
router.get('/roleCountsOfVendor', verifyUser, getRoleCounts);

module.exports = router;
