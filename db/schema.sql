CREATE TABLE IF NOT EXISTS universities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,           -- tên trường
  code VARCHAR(20) UNIQUE NOT NULL,     -- mã trường viết tắt, không đc trùng
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);