const db = require('../config/db');

// 1. Tạo trường đại học mới (CREATE)
exports.createUniversity = async (req, res) => {
  try {
    const { name, code } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên và mã trường!',
      });
    }

    const query = `
      INSERT INTO universities (name, code)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const result = await db.query(query, [name, code]);

    res.status(201).json({
      success: true,
      message: 'Tạo trường đại học thành công!',
      data: result.rows[0],
    });
  } catch (error) {
    // Xử lý lỗi trùng mã trường (Unique Constraint)
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Mã trường này đã tồn tại!',
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 2. Lấy danh sách tất cả các trường (READ - ALL)
exports.getAllUniversities = async (req, res) => {
  try {
    const query = 'SELECT * FROM universities ORDER BY id DESC;';
    const result = await db.query(query);

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

// 3. Lấy thông tin 1 trường theo ID (READ - ONE)
exports.getUniversityById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM universities WHERE id = $1;', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy trường đại học!',
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

// 4. Cập nhật thông tin trường theo ID (UPDATE)
exports.updateUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    const query = `
      UPDATE universities
      SET name = COALESCE($1, name),
          code = COALESCE($2, code)
      WHERE id = $3
      RETURNING *;
    `;
    const result = await db.query(query, [name, code, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy trường để cập nhật!',
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật thành công!',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 5. Xóa trường đại học theo ID (DELETE)
exports.deleteUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM universities WHERE id = $1 RETURNING *;', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy trường để xóa!',
      });
    }

    res.json({
      success: true,
      message: 'Đã xóa trường đại học thành công!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};