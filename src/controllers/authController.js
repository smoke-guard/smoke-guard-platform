const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'smokeguard_secret_key_2026';

// 1. API Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập Email và Mật khẩu!',
      });
    }

    // Tìm user theo Email
    const userResult = await db.query('SELECT * FROM users WHERE email = $1;', [
      email,
    ]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác!',
      });
    }

    const user = userResult.rows[0];

    // So sánh mật khẩu (Hỗ trợ cả plain-text cũ và bcrypt hash mới)
    const isMatch = user.password_hash.startsWith('$2a$')
      ? await bcrypt.compare(password, user.password_hash)
      : password === user.password_hash;

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác!',
      });
    }

    // Tạo JWT Token chứa ID, role và university_id (Hạn dùng: 24h)
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        university_id: user.university_id,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        university_id: user.university_id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};