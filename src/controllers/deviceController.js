const db = require('../config/db');

// 1. Thêm thiết bị mới (CREATE)
exports.createDevice = async (req, res) => {
  try {
    const { university_id, name, device_code, location, status } = req.body;

    if (!university_id || !name || !device_code) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ: university_id, name, device_code!',
      });
    }

    const deviceStatus = status || 'ACTIVE';

    const query = `
      INSERT INTO devices (university_id, name, device_code, location, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await db.query(query, [
      university_id,
      name,
      device_code,
      location || '',
      deviceStatus,
    ]);

    res.status(201).json({
      success: true,
      message: 'Thêm thiết bị cảm biến thành công!',
      data: result.rows[0],
    });
  } catch (error) {
    // Lỗi trùng mã thiết bị
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Mã thiết bị (device_code) này đã tồn tại!',
      });
    }

    // Lỗi không tìm thấy trường Đại học
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

// 2. Lấy danh sách tất cả thiết bị (READ - ALL), hỗ trợ lọc theo university_id
exports.getAllDevices = async (req, res) => {
  try {
    const { university_id } = req.query;

    let query = `
      SELECT
        d.*,
        uni.name AS university_name,
        uni.code AS university_code
      FROM devices d
      JOIN universities uni ON d.university_id = uni.id
    `;
    const params = [];

    if (university_id) {
      query += ` WHERE d.university_id = $1`;
      params.push(university_id);
    }

    query += ` ORDER BY d.id DESC;`;

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

// 3. Lấy thông tin 1 thiết bị theo ID (READ - ONE)
exports.getDeviceById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT
        d.*,
        uni.name AS university_name
      FROM devices d
      JOIN universities uni ON d.university_id = uni.id
      WHERE d.id = $1;
    `;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thiết bị!',
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

// 4. Cập nhật thông tin/trạng thái thiết bị (UPDATE)
exports.updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, device_code, location, status, university_id } = req.body;

    const query = `
      UPDATE devices
      SET name = COALESCE($1, name),
          device_code = COALESCE($2, device_code),
          location = COALESCE($3, location),
          status = COALESCE($4, status),
          university_id = COALESCE($5, university_id)
      WHERE id = $6
      RETURNING *;
    `;
    const result = await db.query(query, [
      name,
      device_code,
      location,
      status,
      university_id,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thiết bị để cập nhật!',
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật thông tin thiết bị thành công!',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 5. Xóa thiết bị (DELETE)
exports.deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'DELETE FROM devices WHERE id = $1 RETURNING id;',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thiết bị để xóa!',
      });
    }

    res.json({
      success: true,
      message: 'Xóa thiết bị thành công!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};