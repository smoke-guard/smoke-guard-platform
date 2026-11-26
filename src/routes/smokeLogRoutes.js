const express = require('express');
const router = express.Router();
const smokeLogController = require('../controllers/smokeLogController');

router.post('/', smokeLogController.createSmokeLog);          // POST /api/smoke-logs (Thiết bị phát cảnh báo)
router.get('/', smokeLogController.getAllSmokeLogs);          // GET /api/smoke-logs (Lấy lịch sử cảnh báo)
router.get('/stats', smokeLogController.getSmokeLogStats);    // GET /api/smoke-logs/stats (Thống kê cho Dashboard)

module.exports = router;