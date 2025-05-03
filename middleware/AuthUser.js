const jwt = require('jsonwebtoken');
const User = require("../models/UserModel.js");

exports.verifyForSignIn = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // Assuming Bearer token

        if (!token) {
            return res.status(401).json({ msg: "Please log in to your account!" });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { uuid: decoded.userId } });

        if (!user) {
            return res.status(401).json({ msg: "Invalid token" });
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error verifying user:', error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};


exports.verifyUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

        if (!token) {
            return res.status(401).json({ msg: "Please log in to your account!" });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { uuid: decoded.userId } });

        if (!user) {
            return res.status(401).json({ msg: "Invalid token" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error verifying user:', error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};


exports.checkRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ msg: "Forbidden access" });
    }
    next();
};

exports.adminOnly = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ msg: "Access forbidden" });
    }
    next();
};
