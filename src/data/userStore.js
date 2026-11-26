const pool = require("../db");

// Các cột được phép trả ra ngoài: KHÔNG bao giờ trả password_hash
const PUBLIC_COLUMNS = `
  users.id, users.username, users.full_name, users.role, users.created_at,
  users.university_id, universities.name AS university_name
`;

// Lấy toàn bộ tài khoản, kèm tên trường
const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT ${PUBLIC_COLUMNS}
     FROM users
     JOIN universities ON universities.id = users.university_id
     ORDER BY users.created_at DESC`,
  );
  return result.rows;
};

// Lấy một tài khoản theo id, không có thì trả về undefined
const getUserById = async (id) => {
  const result = await pool.query(
    `SELECT ${PUBLIC_COLUMNS}
     FROM users
     JOIN universities ON universities.id = users.university_id
     WHERE users.id = $1`,
    [id],
  );
  return result.rows[0];
};

//CRUD:
// Tạo tài khoản mới (mật khẩu đã băm sẵn), trả về thông tin công khai
const createUser = async ({
  universityId,
  username,
  fullName,
  passwordHash,
  role,
}) => {
  const result = await pool.query(
    `INSERT INTO users (university_id, username, full_name, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [universityId, username, fullName, passwordHash, role],
  );
  return getUserById(result.rows[0].id);
};

// Xoá tài khoản, trả về true nếu có xoá được một dòng
const deleteUser = async (id) => {
  const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
  return result.rowCount > 0;
};

module.exports = { getAllUsers, getUserById, createUser, deleteUser };
