const universityStore = require("../data/universityStore");

// Mã lỗi PostgreSQL khi thêm giá trị trùng ở cột UNIQUE để mình biết lỗi gì
const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";

// Lấy và làm sạch dữ liệu gửi lên; thiếu tên hoặc mã thì trả về lỗi
const parseUniversityInput = (body) => {
  const name = body.name?.trim();
  const code = body.code?.trim().toUpperCase(); // mã trường luôn phai viết hoa

  if (!name || !code) {
    return { error: "Thiếu tên trường hoặc mã trường" };
  }
  return { data: { name, code } };
};

// GET /universities
const listUniversities = async (req, res) => {
  try {
    res.json(await universityStore.getAllUniversities());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách trường" });
  }
};

// GET /universities/:id
const getUniversity = async (req, res) => {
  try {
    const university = await universityStore.getUniversityById(
      Number(req.params.id),
    );
    if (!university) {
      return res.status(404).json({ message: "Không tìm thấy trường" });
    }
    res.json(university);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi lấy thông tin trường" });
  }
};

// POST /universities
const createUniversity = async (req, res) => {
  const { data, error } = parseUniversityInput(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  try {
    const university = await universityStore.createUniversity(data);
    res.status(201).json(university);
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) {
      return res.status(409).json({ message: "Mã trường đã tồn tại" });
    }
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi tạo trường" });
  }
};

// PUT /universities/:id
const updateUniversity = async (req, res) => {
  const { data, error } = parseUniversityInput(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  try {
    const university = await universityStore.updateUniversity(
      Number(req.params.id),
      data,
    );
    if (!university) {
      return res.status(404).json({ message: "Không tìm thấy trường" });
    }
    res.json(university);
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) {
      return res.status(409).json({ message: "Mã trường đã tồn tại" });
    }
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi sửa trường" });
  }
};

// DELETE /universities/:id
const deleteUniversity = async (req, res) => {
  try {
    const isDeleted = await universityStore.deleteUniversity(
      Number(req.params.id),
    );
    if (!isDeleted) {
      return res.status(404).json({ message: "Không tìm thấy trường" });
    }
    res.status(204).end(); // 204 = xoá xong, không có gì để trả về hết
  } catch (error) {
    if (error.code === FOREIGN_KEY_VIOLATION) {
      return res
        .status(409)
        .json({ message: "Trường vẫn còn tài khoản, xoá tài khoản trước" });
    }
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi xoá trường" });
  }
};

module.exports = {
  listUniversities,
  getUniversity,
  createUniversity,
  updateUniversity,
  deleteUniversity,
};
