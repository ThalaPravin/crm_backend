const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const User = require("../models/UserModel.js");
const Representative = require("../models/Representative.js");
const Vendor = require("../models/VendorModel.js");
const Lead = require("../models/LeadModel.js");

exports.Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ msg: "User not found" });

        // Verify password
        const match = await argon2.verify(user.password, password);
        if (!match) return res.status(400).json({ msg: "Wrong Password" });

        // Generate JWT token
        const token = jwt.sign({ userId: user.uuid, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Return token and user details in the response
        const { uuid, name, role } = user;
        req.session.userId = user.uuid;
        req.session.role = user.role;
        res.status(200).json({ token, user: { uuid, name, email, role } });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

exports.Me = async (req, res) => {
    try {
        const { userId } = req.user;

        // Retrieve user based on JWT token
        const user = await User.findOne({
            attributes: ['uuid', 'name', 'email', 'role'],
            where: { uuid: userId }
        });
        if (!user) return res.status(404).json({ msg: "User not found" });

        // Handle different roles and fetch respective data
        if (user.role === 'representative') {
            const representativeData = await Representative.findOne({ where: { uuid: userId } });
            if (!representativeData) return res.status(404).json({ msg: "Representative data not found" });

            const { totalVendors, profileImage } = representativeData;
            return res.status(200).json({ ...user.dataValues, totalVendors, profileImage });
        } else if (user.role === 'vendor') {
            const vendorData = await Vendor.findOne({ where: { uuid: userId } });
            if (!vendorData) return res.status(404).json({ msg: "Vendor data not found" });

            const { mobile, address } = vendorData;
            return res.status(200).json({ ...user.dataValues, mobile, address });
        } else if (user.role === 'lead') {
            const leadData = await Lead.findOne({ where: { uuid: userId } });
            if (!leadData) return res.status(404).json({ msg: "Lead data not found" });

            const { mobile, address, product_category, product_selection, lead_status } = leadData;
            return res.status(200).json({ ...user.dataValues, mobile, address, product_category, product_selection, lead_status });
        } else {
            return res.status(200).json(user);
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

exports.logOut = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(400).json({ msg: "Unable to logout" });
        res.status(200).json({ msg: "You have been logged out" });
    });
};
