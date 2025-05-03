const Representative = require("../models/Representative.js");
const User = require("../models/UserModel.js");
const argon2 = require("argon2");

const createRepresentative = async (req, res) => {
    const { name, email, password, confPassword, totalVendors, profileImage } = req.body;
    const createdBy = req.user.uuid;

    if (password !== confPassword) {
        return res.status(400).json({ msg: "Password and Confirm Password do not match" });
    }

    const hashPassword = await argon2.hash(password);

    try {
        // Step 1: Create User with role 'representative'
        const user = await User.create({
            name: name,
            email: email,
            password: hashPassword,
            role: 'representative',
            createdBy: createdBy,
            copyofpassword: password
        });

        // Step 2: Create Representative with the User's UUID
        const representative = await Representative.create({
            uuid: user.uuid,
            name: name,
            totalVendors: totalVendors,
            profileImage: profileImage
        });

        res.status(201).json({ msg: "Representative created successfully", representative });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

const getRepresentatives = async (req, res) => {
    try {
        const response = await Representative.findAll({
            attributes: ['uuid', 'name', 'totalVendors', 'profileImage'],
            include: {
                model: User,
                attributes: ['uuid', 'name', 'email', 'role']
            }
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const getRepresentativeById = async (req, res) => {
    try {
        const representative = await Representative.findOne({
            where: {
                uuid: req.params.id
            },
            include: {
                model: User,
                attributes: ['uuid', 'name', 'email', 'role']
            }
        });

        if (!representative) {
            return res.status(404).json({ msg: "Representative not found" });
        }

        res.status(200).json(representative);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const updateRepresentative = async (req, res) => {
    try {
        const representative = await Representative.findOne({
            where: {
                uuid: req.params.id
            }
        });

        if (!representative) {
            return res.status(404).json({ msg: "Representative not found" });
        }

        if (req.user.role !== 'admin' && representative.uuid !== req.user.uuid) {
            return res.status(403).json({ msg: "You are not authorized to update this representative" });
        }

        const { name, totalVendors, profileImage } = req.body;
        representative.name = name || representative.name;
        representative.totalVendors = totalVendors || representative.totalVendors;
        representative.profileImage = profileImage || representative.profileImage;

        await representative.save();
        res.status(200).json({ msg: "Representative updated successfully" });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

const deleteRepresentative = async (req, res) => {
    try {
        const representative = await Representative.findOne({
            where: {
                uuid: req.params.id
            }
        });

        if (!representative) {
            return res.status(404).json({ msg: "Representative not found" });
        }

        if (req.user.role !== 'admin' && representative.uuid !== req.user.uuid) {
            return res.status(403).json({ msg: "You are not authorized to delete this representative" });
        }

        await Representative.destroy({
            where: {
                uuid: req.params.id
            }
        });

        res.status(200).json({ msg: "Representative deleted successfully" });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

module.exports = {
    createRepresentative,
    getRepresentatives,
    getRepresentativeById,
    updateRepresentative,
    deleteRepresentative
};
