const db = require('../config/db');

// 1. Tạo nhật ký cảnh báo khói mới (Dành cho thiết bị IoT gửi dữ liệu lên)
exports.createSmokeLog = async (req, res) => {
  try {
    const { device_code, smoke_level, gas_level, status } = req.body;

    if (!device_code) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã thiết bị (device_code)!',
      });
    }

    // Lấy thông tin thiết bị và trường đại học từ device_code
    const deviceResult = await db.query(
      'SELECT id, university_id, location FROM devices WHERE device_code = $1;',
      [device_code]
    );

    if (deviceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Thiết bị cảm biến không tồn tại trên hệ thống!',
      });
    }

    const device = deviceResult.rows[0];
    const alertStatus = status || 'WARNING'; // WARNING hoặc ALERT

    const query = `
      INSERT INTO smoke_logs (device_id, university_id, smoke_level, gas_level, location, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const result = await db.query(query, [
      device.id,
      device.university_id,
      smoke_level || 0,
      gas_level || 0,
      device.location,
      alertStatus,
    ]);

    const alertData = result.rows[0];

    // 🚀 Lấy đối tượng io từ app và phát sự kiện Real-time
    const io = req.app.get('io');
    if (io) {
      io.emit('new_smoke_alert', {
        message: '🚨 CẢNH BÁO: Phát hiện nồng độ khói vượt ngưỡng!',
        data: alertData,
      });
    }

    res.status(201).json({
      success: true,
      message: '🚨 Đã ghi nhận cảnh báo khói mới và phát tín hiệu Real-time!',
      data: alertData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 2. Lấy danh sách lịch sử cảnh báo (Lọc theo university_id hoặc device_id)
exports.getAllSmokeLogs = async (req, res) => {
  try {
    const { university_id, device_id } = req.query;

    let query = `
      SELECT
        sl.*,
        d.name AS device_name,
        d.device_code,
        uni.name AS university_name
      FROM smoke_logs sl
      JOIN devices d ON sl.device_id = d.id
      JOIN universities uni ON sl.university_id = uni.id
    `;
    const params = [];

    if (university_id) {
      query += ` WHERE sl.university_id = $1`;
      params.push(university_id);
    } else if (device_id) {
      query += ` WHERE sl.device_id = $1`;
      params.push(device_id);
    }

    query += ` ORDER BY sl.created_at DESC;`;

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

// 3. Thống kê tổng số lượt cảnh báo (Phục vụ hiển thị Widget Dashboard)
exports.getSmokeLogStats = async (req, res) => {
  try {
    const { university_id } = req.query;

    let query = `
      SELECT
        COUNT(*) AS total_alerts,
        COUNT(CASE WHEN status = 'ALERT' THEN 1 END) AS critical_alerts,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) AS alerts_last_24h
      FROM smoke_logs
    `;
    const params = [];

    if (university_id) {
      query += ` WHERE university_id = $1`;
      params.push(university_id);
    }

    const result = await db.query(query, params);

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