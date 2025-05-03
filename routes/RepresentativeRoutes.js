const express = require("express");
const {
    getRepresentatives,
    getRepresentativeById,
    createRepresentative,
    updateRepresentative,
    deleteRepresentative
} = require("../controllers/RepresentativeController.js");
const { verifyUser } = require("../middleware/AuthUser.js");

const router = express.Router();

router.get('/representatives', verifyUser, getRepresentatives);
router.get('/representative/:id', verifyUser, getRepresentativeById);
router.post('/representative', verifyUser, createRepresentative);
router.patch('/representative/:id', verifyUser, updateRepresentative);
router.delete('/representative/:id', verifyUser, deleteRepresentative);

module.exports = router;
