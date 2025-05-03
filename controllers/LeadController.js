const Lead = require("../models/LeadModel");
const TPMS = require("../models/TPMSModel");
const User = require("../models/UserModel");
const Vendor = require("../models/VendorModel");
const argon2 = require("argon2");

const createLead = async (req, res) => {
    const { name, email, password, confPassword, mobile, address, product_category, product_selection, lead_status, vendorId, createdByName } = req.body;

    if (password !== confPassword) {
        return res.status(400).json({ msg: "Password and Confirm Password do not match" });
    }

    const hashPassword = await argon2.hash(password);

    try {
        // Step 1: Check if the user already exists
        let user = await User.findOne({ where: { email: email } });

        // If user doesn't exist, create a new user
        if (!user) {
            user = await User.create({
                name: name,
                email: email,
                password: hashPassword,
                role: 'lead',
                createdBy: vendorId,
                copyofpassword: password // This field should be used cautiously
            });
        }

        // Step 2: Iterate over product_selection and create leads if they don't exist
        const createdLeads = [];
        for (let product of product_selection) {
            const existingLead = await Lead.findOne({
                where: {
                    email: email,
                    product_selection: product
                }
            });

            if (!existingLead) {
                const lead = await Lead.create({
                    uuid: user.uuid,
                    name: name,
                    email: email,
                    mobile: mobile,
                    address: address,
                    product_category: product_category,
                    product_selection: product,
                    lead_status: lead_status,
                    createdBy: vendorId,
                    createdByName: createdByName
                });
                createdLeads.push(lead);
            }
        }

        if (createdLeads.length > 0) {
            res.status(201).json({ msg: "Leads created successfully", createdLeads });
        } else {
            res.status(400).json({ msg: "No new leads were created. All selected products already have leads." });
        }
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};


const getLeads = async (req, res) => {
    try {
        const response = await Lead.findAll({
            attributes: ['id', 'uuid', 'name', 'email', 'mobile', 'address', 'product_category', 'product_selection', 'lead_status', 'createdByName', 'createdAt', 'createdBy'],
            include: {
                model: User,
                attributes: ['uuid', 'name', 'email', 'role','copyofpassword']
            }
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const getLeadById = async (req, res) => {
    try {
        const lead = await Lead.findOne({
            where: {
                id: req.params.id
            },
            include: {
                model: User,
                attributes: ['uuid', 'name', 'email', 'role']
            }
        });

        if (!lead) {
            return res.status(404).json({ msg: "Lead not found" });
        }

        res.status(200).json(lead);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const getLeadByVendor = async (req, res) => {
    try {
        const lead = await Lead.findAll({
            where: {
                createdBy: req.params.id
            },
            include: {
                model: User,
                attributes: ['uuid', 'name', 'email', 'role']
            }
        });

        if (!lead) {
            return res.status(404).json({ msg: "Lead not found" });
        }

        res.status(200).json(lead);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const updateLead = async (req, res) => {
    try {
        const lead = await Lead.findOne({
            where: {
                uuid: req.params.id
            }
        });

        if (!lead) {
            return res.status(404).json({ msg: "Lead not found" });
        }

        const { name, email, mobile, address, product_category, product_selection, lead_status } = req.body;
        lead.name = name || lead.name;
        lead.email = email || lead.email;
        lead.mobile = mobile || lead.mobile;
        lead.address = address || lead.address;
        lead.product_category = product_category || lead.product_category;
        lead.product_selection = product_selection || lead.product_selection;
        lead.lead_status = lead_status || lead.lead_status;

        await lead.save();
        res.status(200).json({ msg: "Lead updated successfully" });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

const changeStatus = async (req, res) => {
    try {
        
        const { uuid, lead_status } = req.body;
        const lead = await Lead.findOne({
            where: {
                id: uuid
            }
        });

        if (!lead) {
            return res.status(404).json({ msg: "Lead not found" });
        }

        // Update lead status to "Trade Done"
        lead.lead_status = lead_status;

        await lead.save();
        res.status(200).json({ msg: "Lead converted successfully" });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};


const deleteLead = async (req, res) => {
    try {
        const lead = await Lead.findOne({
            where: {
                uuid: req.params.id
            }
        });

        if (!lead) {
            return res.status(404).json({ msg: "Lead not found" });
        }

        await Lead.destroy({
            where: {
                uuid: req.params.id
            }
        });

        res.status(200).json({ msg: "Lead deleted successfully" });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};


const getTPMSById = async (req, res) => {
    try {
        // Step 1: Find the lead by the given ID
        const lead = await Lead.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!lead) {
            return res.status(404).json({ msg: "Lead not found" });
        }

        // Step 2: Use the lead's UUID to find the TPMS account
        const tpms = await TPMS.findOne({
            where: {
                uuid: lead.uuid
            }
        });

        if (!tpms) {
            return res.status(404).json({ msg: "TPMS account not found for the given lead" });
        }

        // Step 3: Combine lead and TPMS information
        const combinedData = {
            lead: lead,
            tpms: tpms
        };

        // Step 4: Send the combined information
        res.status(200).json(combinedData);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const createTPMS = async (req, res) => {
    const {
        adharNumber,
        panNumber,
        bankName,
        ifscCode,
        accountNumber,
        fullNameAsPerBank,
        leadUuid
    } = req.body;

    try {
        // Step 1: Check if the lead already exists and is valid
        const lead = await Lead.findOne({
            where: {
                uuid: leadUuid,
                product_selection: "TPMS"
            }
        });

        if (!lead) {
            return res.status(404).json({ msg: "Lead not found" });
        }

        // Step 2: Check if TPMS account already exists for this lead
        const existingTPMS = await TPMS.findOne({
            where: {
                uuid: leadUuid
            }
        });

        if (existingTPMS) {
            return res.status(400).json({ msg: "TPMS account already exists for this lead" });
        }

        // Step 3: Create TPMS account
        const tpmsAccount = await TPMS.create({
            uuid: leadUuid,
            adharNumber: adharNumber,
            panNumber: panNumber,
            bankName: bankName,
            ifscCode: ifscCode,
            accountNumber: accountNumber,
            fullNameAsPerBank: fullNameAsPerBank
        });

        lead.lead_status = "Account Created";

        await lead.save();
        

        res.status(201).json({ msg: "TPMS account created successfully", tpmsAccount });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    createLead,
    getLeads,
    getLeadById,
    getLeadByVendor,
    updateLead,
    deleteLead,
    changeStatus,
    createTPMS,
    getTPMSById
};