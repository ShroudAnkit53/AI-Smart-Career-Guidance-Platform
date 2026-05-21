const express = require('express');
const router = express.Router();
const Users = require('../model/Users');
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, skills, bio } = req.body;
        if (!name || !email || !password || !skills || !bio) return res.status(400).json({ status: false, message: 'Please enter all required fields' });

        const existingUser = await Users.findOne({ email });
        if (existingUser) return res.status(400).json({ status: false, message: 'User already exists' });

        const hashedPassword = await bycrypt.hash(password, 10);

        const newUser = new Users({ name, email, password: hashedPassword, skills, bio });
        await newUser.save();
        
        return res.status(201).json({ status: true, message: 'Register Succesfull' });
    } catch (error) {
        return res.status(400).json({ status: false, message: 'Something went wrong', error: error.message });
    }
});

//Login
router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) return res.status(400).json({ status: false, message: 'Please enter all required fields' });

        const user = await Users.findOne({ email });
        if(!user || !await bycrypt.compare(password, user.password)) return res.status(400).json({ status: false, message: 'Invalid Credentials' });

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        return res.status(201).json({ status: true, message: 'Login Succesfull', token: token });
    } catch (error) {
        return res.status(400).json({ status: false, message: 'Something went wrong', error: error.message });
    }
});

//Profile
router.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ status: false, message: 'Unauthorized' });

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) return res.status(401).json({ status: false, message: 'Unauthorized' });

            const user = await Users.findById(decoded?.id);
            if(!user) return res.status(404).json({ status: false, message: 'Invalid Token' });
            const userData = {
                name: user?.name,
                email: user?.email,
                skills: user?.skills,
                bio: user?.bio
            }
            return res.status(201).json({ status: true, message: 'Profile Data', data: userData });
            
        });

    } catch (error) {
        return res.status(400).json({ status: false, message: 'Something went wrong', error: error.message });
    }
});

// Update Profile
router.put('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ status: false, message: 'Unauthorized' });

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) return res.status(401).json({ status: false, message: 'Unauthorized' });

            let { name, skills, bio } = req.body;

            // 🔥 Force skills to always be array
            if (typeof skills === "string") {
                skills = skills.split(",").map(s => s.trim()).filter(Boolean);
            }

            const updatedUser = await Users.findByIdAndUpdate(
                decoded.id,
                { name, skills, bio },
                { new: true }
            );

            return res.status(200).json({
                status: true,
                message: "Profile Updated",
                data: updatedUser
            });
        });

    } catch (error) {
        return res.status(400).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
});

// Delete Account
router.delete('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ status: false, message: 'Unauthorized' });

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) return res.status(401).json({ status: false, message: 'Unauthorized' });

            const deletedUser = await Users.findByIdAndDelete(decoded.id);

            if (!deletedUser) {
                return res.status(404).json({ status: false, message: 'User not found' });
            }

            return res.status(200).json({
                status: true,
                message: 'Account Deleted Successfully'
            });
        });

    } catch (error) {
        return res.status(400).json({
            status: false,
            message: 'Something went wrong',
            error: error.message
        });
    }
});

module.exports = router;