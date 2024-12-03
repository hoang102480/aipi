const express = require('express');
const router = express.Router();
const User = require('../models/users.model');
const userController = require('../controllers/users.controller');
const bcrypt = require('bcryptjs'); // Dùng để mã hóa và kiểm tra mật khẩu
const jwt = require('jsonwebtoken'); // Dùng để tạo JWT token

// Đăng ký người dùng mới
router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;

    try {
        // Kiểm tra nếu email đã tồn tại
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        // Mã hóa mật khẩu trước khi lưu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới
        const newUser = new User({ firstName, lastName, email, password: hashedPassword, role });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

// Đăng nhập người dùng
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // So sánh mật khẩu
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Tạo JWT token nếu đăng nhập thành công
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'defaultsecret', { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// Các route khác
router.get('/dss', userController.getuser);

// Tạo mới một người dùng
router.post('/create', userController.createuser);

// Xóa tất cả người dùng
router.delete('/deleteAll', userController.deleteAllusers);

module.exports = router;
