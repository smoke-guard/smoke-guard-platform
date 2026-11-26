const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

router.post('/', deviceController.createDevice);       // POST /api/devices
router.get('/', deviceController.getAllDevices);       // GET /api/devices (hoặc /api/devices?university_id=1)
router.get('/:id', deviceController.getDeviceById);    // GET /api/devices/:id
router.put('/:id', deviceController.updateDevice);     // PUT /api/devices/:id
router.delete('/:id', deviceController.deleteDevice);  // DELETE /api/devices/:id

module.exports = router;