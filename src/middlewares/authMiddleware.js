const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'smokeguard_secret_key_2026';

// Middleware xác thực JWT Token
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Thiếu token xác thực (Authorization: Bearer <token>)!',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Chứa { id, username, role, university_id }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn!',
    });
  }
};

// Middleware kiểm tra quyền theo role (tùy chọn dùng cho các route quản trị)
exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện thao tác này!',
      });
    }
    next();
  };
};