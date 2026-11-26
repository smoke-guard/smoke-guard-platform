require("dotenv").config();

const express = require("express");
const healthRoutes = require("./routes/healthRoutes");
const universityRoutes = require("./routes/universityRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // đọc dữ liệu JSON gửi lên
app.use(express.urlencoded({ extended: true })); // đọc dữ liệu form HTML gửi lên

app.use("/health", healthRoutes);
app.use("/universities", universityRoutes);

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
