CREATE TABLE IF NOT EXISTS universities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,           -- tên trường
  code VARCHAR(20) UNIQUE NOT NULL,     -- mã trường viết tắt, không đc trùng
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tài khoản đăng nhập, mỗi tài khoản thuộc một trường
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  university_id INTEGER NOT NULL REFERENCES universities(id), -- trường mà tài khoản đó thuộc về
  username VARCHAR(50) UNIQUE NOT NULL,   -- tên đăng nhập, không đc trùng
  full_name VARCHAR(100) NOT NULL,        -- họ tên hiển thị
  password_hash TEXT NOT NULL,            -- chỉ lưu mật khẩu đã băm bằng bcrypt, không có lưu mật khẩu gốc
  role VARCHAR(20) NOT NULL DEFAULT 'supervisor'
    CHECK (role IN ('admin', 'manager', 'supervisor')), -- quản trị / cán bộ quản lý / giám thị
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);