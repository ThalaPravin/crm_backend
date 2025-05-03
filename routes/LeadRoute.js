const express = require("express");
const {
    createLead,
    getLeads,
    getLeadById,
    updateLead,
    deleteLead,
    changeStatus,
    getLeadByVendor,
    createTPMS,
    getTPMSById
} = require("../controllers/LeadController.js");
const { verifyUser } = require("../middleware/AuthUser.js");

const router = express.Router();

router.post('/leads', verifyUser, createLead);
router.get('/leads', verifyUser, getLeads);
router.get('/lead/:id', verifyUser, getLeadById);
router.get('/leadsByVendor/:id', verifyUser, getLeadByVendor);
router.patch('/leads/:id', verifyUser, updateLead);
router.delete('/leads/:id', verifyUser, deleteLead);
router.post('/changeStatus', verifyUser, changeStatus);
router.post('/tpms', verifyUser, createTPMS);
router.get('/tpms/:id', verifyUser, getTPMSById);

module.exports = router;