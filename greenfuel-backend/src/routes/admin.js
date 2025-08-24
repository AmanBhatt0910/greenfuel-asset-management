const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email, phone, role, passwordHash: hash });
    res.json({ admin });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) return res.status(400).json({ error: 'Invalid email' });
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return res.status(400).json({ error: 'Invalid password' });
    const token = jwt.sign(
      { id: admin.id, name: admin.name, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    res.json({ token, admin: { name: admin.name, email: admin.email, phone: admin.phone, role: admin.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/change-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
    }
    const valid = await bcrypt.compare(oldPassword, admin.passwordHash);
    if (!valid) {
        return res.status(400).json({ error: 'Old password is incorrect' });
    }
    const newHash = await bcrypt.hash(newPassword, 10);
    admin.passwordHash = newHash;
    await admin.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
