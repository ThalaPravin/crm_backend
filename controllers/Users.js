
const Lead = require("../models/LeadModel.js");
const User = require("../models/UserModel.js");
const argon2 = require("argon2");

const createUser = async (req, res) => {
    const { name, email, password, confPassword, role } = req.body;
    const createdBy = req.user.uuid;
    
    if (password !== confPassword) {
        return res.status(400).json({ msg: "Password and Confirm Password do not match" });
    }

    const hashPassword = await argon2.hash(password);
    
    try {
        const newUser = await User.create({
            name: name,
            email: email,
            password: hashPassword,
            role: role,
            createdBy: createdBy,
            copyofpassword: password
        });

        res.status(201).json({ msg: "User created successfully", newUser });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        let whereClause = {};
        
        if (req.user && req.user.role) {
            if (req.user.role !== 'admin') {
                whereClause = {
                    createdBy: req.user.uuid,
                    role: 'student'
                };
            }
        }
        
        const response = await User.findAll({});
        
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findOne({
            attributes: ['uuid', 'name', 'email', 'role', 'createdBy','copyofpassword'],
            where: {
                uuid: req.params.id
            }
        });
        
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        
        if (req.user.role !== 'admin' && user.createdBy !== req.user.uuid) {
            return res.status(403).json({ msg: "You are not authorized to access this user" });
        }
        
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const getUserByEmail = async (req, res) => {
    try {
        console.log("Request params:", req.params);
       

        const user = await User.findOne({
            attributes: ['uuid', 'name', 'email',  'createdBy', 'copyofpassword'],
            where: {
                email: req.params.email
            }
        });
        console.log(user)
        if (!user) {
            console.log("User not found for email:", req.params.email);
            return res.status(404).json({ msg: "User not found" });
        }


        res.status(200).json(user);
    } catch (error) {
        console.error("Error in getUserByEmail:", error.message);
        res.status(500).json({ msg: error.message });
    }
};



const updateUser = async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                uuid: req.params.id
            }
        });
        
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        
        if (req.user.role !== 'admin' && user.createdBy !== req.user.uuid) {
            return res.status(403).json({ msg: "You are not authorized to update this user" });
        }
        
        const { name, email, role, password } = req.body;
        
        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;

        if (password) {
            const hashPassword = await argon2.hash(password);
            user.password = hashPassword;
        }

        await user.save();
        
        res.status(200).json({ msg: "User Updated" });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};


const ChangePassword = async (req, res) => {
    try {
        const { uuid, newPassword } = req.body;

        if (!uuid || !newPassword) {
            return res.status(400).json({ msg: "UUID and new password are required" });
        }

        const user = await User.findOne({
            where: {
                uuid: uuid
            }
        });

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        if (req.user.role !== 'admin' && user.uuid !== req.user.uuid) {
            return res.status(403).json({ msg: "You are not authorized to update this user's password" });
        }

        const hashPassword = await argon2.hash(newPassword);
        user.password = hashPassword;
        user.copyofpassword = hashPassword;

        await user.save();

        res.status(200).json({ msg: "Password updated successfully" });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ msg: error.message });
    }
};


const deleteUser = async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                uuid: req.params.id
            }
        });
        
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        
        if (req.user.role !== 'admin' && user.createdBy !== req.user.uuid) {
            return res.status(403).json({ msg: "You are not authorized to delete this user" });
        }
        
        await User.destroy({
            where: {
                uuid: req.params.id
            }
        });

        res.status(200).json({ msg: "User Deleted" });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

// const getRoleCounts = async (req, res) => {
//     try {
//         const roles = ['representative', 'vendor', 'lead'];
//         const counts = await Promise.all(
//             roles.map(role => User.count({ where: { role } }))
//         );

//         const dealCount = await Lead.count({
//             where: {
//                 status: 'Trade Done'
//             }
//         });

//         const response = roles.reduce((acc, role, index) => {
//             acc[role] = counts[index];
//             return acc;
//         }, {});

//         response.deal = dealCount;

//         res.status(200).json(response);
//     } catch (error) {
//         res.status(500).json({ msg: error.message });
//     }
// };

const getRoleCounts = async (req, res) => {
    try {
        const representativeCount = await User.count({ where: { role: 'representative' } });
        const vendorCount = await User.count({ where: { role: 'vendor' } });
        const leadCount = await User.count({ where: { role: 'lead' } });
        const dealCount = await Lead.count({
            where: {
                lead_status: 'Trade Done'
            }
        });

        const data = {
            representative: representativeCount,
            vendor: vendorCount,
            lead: leadCount,
            deal: dealCount
        }

        res.status(200).json({
            data
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};




module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    ChangePassword,
    getRoleCounts,
    getUserByEmail
};
