const db = require('../config/db');

// 1. Tạo tài khoản User mới (CREATE)
exports.createUser = async (req, res) => {
  try {
    const { university_id, username, email, password, role } = req.body;

    if (!university_id || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ: university_id, username, email, password!',
      });
    }

    const password_hash = password;
    const userRole = role || 'STAFF';

    const query = `
      INSERT INTO users (university_id, username, email, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, university_id, username, email, role, created_at;
    `;
    const result = await db.query(query, [
      university_id,
      username,
      email,
      password_hash,
      userRole,
    ]);

    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản người dùng thành công!',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Username hoặc Email đã tồn tại!',
      });
    }

    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'Trường Đại học (university_id) không tồn tại!',
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 2. Lấy danh sách tất cả User (READ - ALL), kèm thông tin Tên trường Đại học
exports.getAllUsers = async (req, res) => {
  try {
    const { university_id } = req.query;

    let query = `
      SELECT
        u.id,
        u.username,
        u.email,
        u.role,
        u.created_at,
        u.university_id,
        uni.name AS university_name,
        uni.code AS university_code
      FROM users u
      JOIN universities uni ON u.university_id = uni.id
    `;
    const params = [];

    if (university_id) {
      query += ` WHERE u.university_id = $1`;
      params.push(university_id);
    }

    query += ` ORDER BY u.id DESC;`;

    const result = await db.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 3. Lấy thông tin 1 User theo ID (READ - ONE)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT
        u.id,
        u.username,
        u.email,
        u.role,
        u.created_at,
        u.university_id,
        uni.name AS university_name
      FROM users u
      JOIN universities uni ON u.university_id = uni.id
      WHERE u.id = $1;
    `;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng!',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 4. Cập nhật thông tin User (UPDATE)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, university_id } = req.body;

    const query = `
      UPDATE users
      SET username = COALESCE($1, username),
          email = COALESCE($2, email),
          role = COALESCE($3, role),
          university_id = COALESCE($4, university_id)
      WHERE id = $5
      RETURNING id, university_id, username, email, role, created_at;
    `;
    const result = await db.query(query, [
      username,
      email,
      role,
      university_id,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng để cập nhật!',
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật thông tin người dùng thành công!',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 5. Xóa User theo ID (DELETE)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING id;',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng để xóa!',
      });
    }

    res.json({
      success: true,
      message: 'Xóa người dùng thành công!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
