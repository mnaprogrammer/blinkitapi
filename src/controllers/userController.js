const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const genToken = require("../utils/generateToken");
require ("dotenv").config();
const path = require("path");
const fs = require("fs");

const createUser = async(req, res) => {
    try {
        const {name, email, mobileNo, address, password, role} = req.body;
        const user = await User.findOne({email: email});
        if(user) {
            return res.status(400).json({message: "User already exists"});
        }
        if (!validatePassword(password)) {
            return res.status(400).json({ error: "Password is weak!" });
        }
        const profilePicUrl = req.file ? `${process.env.SITE_URL}/uploads/${req.file.filename}` : null;
        const verifyToken = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const newUser = new User({
            name,
            email,
            mobileNo,
            address,
            password,
            profilePic: profilePicUrl,
            role,
            verifyToken: verifyToken,
            verified: false
        });
        await newUser.save();
        const verificationLink = `${process.env.SITE_URL}:${process.env.PORT}/api/user/verify/${verifyToken}`;
        await sendEmail(email, "Verify Your Email", `<p>Click <a href="${verificationLink}">here</a> to verify your account.</p>`);
        res.status(201).json({message: "User created successfully, Verify email sent, please confirm your email to continue"
        })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateUser = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        console.log(user)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const profilePicUrl = req.file ? `${process.env.SITE_URL}/uploads/${req.file.filename}` : null;
        if (profilePicUrl) {
            // Extract the filename from the URL
            const filename = path.basename(user.profilePic);
            // Define file path
            const filePath = path.join(__dirname, "../../uploads", filename);
            console.log(filePath);
            // Delete the file if it exists
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log("Profile picture deleted:", filePath);
            }
        }
        const {name, mobileNo, address} = req.body;
        user.name = name || user.name;
        user.mobileNo = mobileNo || user.mobileNo;
        user.address = address || user.address;
        user.profilePic = profilePicUrl || user.profilePic;
        await user.save()
        res.status(200).json({message: "User updated successfully"});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getUsers = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const users = await User.find();
        res.status(200).json({totalUsers: totalUsers, users});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const verifyEmail = async (req, res) => {
    try {
        const {token} = req.params;
        const user = await User.findOne({verifyToken: token});
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.verified = true;
        user.verifyToken = null
        await user.save();
        res.status(200).json({message: "Email verified successfully"});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email: email});
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!user.verified) {
            return res.status(400).json({ message: "Please verify your email" });
        }
        if (!user.comparePassword(password)) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = genToken(user);
        const {_id, name, role, mobileNo, address, profilePic} = user;
        return res.status(200).json({_id, token, name, email, role, mobileNo, address, profilePic });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        if (deletedUser.profilePic) {
            // Extract the filename from the URL
            const filename = path.basename(deletedUser.profilePic);
            // Define file path
            const filePath = path.join(__dirname, "../../uploads", filename);
            // Delete the file if it exists
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log("Profile picture deleted:", filePath);
            }
        }
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const validatePassword = password => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

module.exports = {createUser, updateUser, getUsers, getUserById, verifyEmail, loginUser, deleteUser};