const { Pool } = require('pg');

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'db',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'secret',
        database: process.env.POSTGRES_DB || 'smokeguard_db',
      }
);

const query = (text, params) => pool.query(text, params);

const initDb = async () => {
  const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS universities (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      university_id INTEGER NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'STAFF',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS devices (
      id SERIAL PRIMARY KEY,
      university_id INTEGER NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      device_code VARCHAR(100) NOT NULL UNIQUE,
      location VARCHAR(255) DEFAULT '',
      status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS smoke_logs (
      id SERIAL PRIMARY KEY,
      device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
      university_id INTEGER NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
      smoke_level DOUBLE PRECISION NOT NULL DEFAULT 0,
      gas_level DOUBLE PRECISION NOT NULL DEFAULT 0,
      location VARCHAR(255) DEFAULT '',
      status VARCHAR(50) NOT NULL DEFAULT 'WARNING',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  
  `;

  try {
    await pool.query(createTablesQuery);
    console.log('✅ Đã kết nối PostgreSQL và sẵn sàng các bảng universities, users, devices.');
  } catch (error) {
    console.error('❌ Lỗi khởi tạo database:', error.message);
  }
};

module.exports = {
  pool,
  query,
  initDb,
};