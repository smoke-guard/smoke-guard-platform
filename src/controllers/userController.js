const bcrypt = require("bcryptjs");
const userStore = require("../data/userStore");

const SALT_ROUNDS = 10; // độ kỹ khi băm mật khẩu
const ALLOWED_ROLES = ["admin", "manager", "supervisor"];
const MIN_PASSWORD_LENGTH = 6;
const USERNAME_PATTERN = /^[a-z0-9_]{3,50}$/; // username gồm có:chữ thường, số, dấu gạch dưới, 3–50 ký tự

// Mã lỗi PostgreSQL
const UNIQUE_VIOLATION = "23505"; // trùng giá trị ở cột UNIQUE
const FOREIGN_KEY_VIOLATION = "23503"; // trỏ tới dòng không tồn tại ở bảng khác

// Kiểm tra dữ liệu tạo tài khoản; sai thì trả về lời báo lỗi
const parseNewUserInput = (body) => {
  const username = body.username?.trim().toLowerCase();
  const fullName = body.fullName?.trim();
  const password = body.password;
  const role = body.role || "supervisor";
  const universityId = Number(body.universityId);

  if (!username || !fullName || !password || !body.universityId) {
    return { error: "Thiếu universityId, username, fullName hoặc password" };
  }
  if (!USERNAME_PATTERN.test(username)) {
    return {
      error: "Tên đăng nhập chỉ gồm chữ thường, số, dấu _ và dài 3–50 ký tự",
    };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự` };
  }
  if (!ALLOWED_ROLES.includes(role)) {
    return { error: "Vai trò chỉ được là admin, manager hoặc supervisor" };
  }
  if (!Number.isInteger(universityId)) {
    return { error: "universityId phải là số" };
  }
  return { data: { universityId, username, fullName, password, role } };
};

// GET /users
const listUsers = async (req, res) => {
  try {
    res.json(await userStore.getAllUsers());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách tài khoản" });
  }
};

// GET /users/:id
const getUser = async (req, res) => {
  try {
    const user = await userStore.getUserById(Number(req.params.id));
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi lấy tài khoản" });
  }
};

// POST /users
const createUser = async (req, res) => {
  const { data, error } = parseNewUserInput(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  try {
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await userStore.createUser({ ...data, passwordHash });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) {
      return res.status(409).json({ message: "Tên đăng nhập đã tồn tại" });
    }
    if (err.code === FOREIGN_KEY_VIOLATION) {
      return res
        .status(400)
        .json({ message: "Trường (universityId) không tồn tại" });
    }
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi tạo tài khoản" });
  }
};

// DELETE /users/:id
const deleteUser = async (req, res) => {
  try {
    const isDeleted = await userStore.deleteUser(Number(req.params.id));
    if (!isDeleted) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi xoá tài khoản" });
  }
};

module.exports = { listUsers, getUser, createUser, deleteUser };
