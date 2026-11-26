const pool = require("../db");

// GET / kiểm tra server và database còn sống khong
const checkHealth = async (req, res) => {
  try {
    await pool.query("SELECT 1"); // thử kết nối
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", database: "disconnected" });
  }
};

module.exports = { checkHealth };
