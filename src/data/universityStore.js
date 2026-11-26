const pool = require("../db");

// Lấy toàn bộ trường, sắp theo tên
const getAllUniversities = async () => {
  const result = await pool.query("SELECT * FROM universities ORDER BY name");
  return result.rows;
};

// Lấy một trường theo id, không có thì trả về undefined
const getUniversityById = async (id) => {
  const result = await pool.query("SELECT * FROM universities WHERE id = $1", [
    id,
  ]);
  return result.rows[0];
};

//simple CRUD:

// Tạo trường mới, trả về dòng vừa tạo
const createUniversity = async ({ name, code }) => {
  const result = await pool.query(
    "INSERT INTO universities (name, code) VALUES ($1, $2) RETURNING *",
    [name, code],
  );
  return result.rows[0];
};

// Sửa thông tin trường, trả về dòng sau khi sửa (không có trường đó thì undefined)
const updateUniversity = async (id, { name, code }) => {
  const result = await pool.query(
    `UPDATE universities
     SET name = $1, code = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [name, code, id],
  );
  return result.rows[0];
};

// Xoá trường, trả về true nếu có xoá được một dòng
const deleteUniversity = async (id) => {
  const result = await pool.query("DELETE FROM universities WHERE id = $1", [
    id,
  ]);
  return result.rowCount > 0;
};

module.exports = {
  getAllUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity,
};
