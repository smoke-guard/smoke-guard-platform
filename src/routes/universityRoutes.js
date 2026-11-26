const express = require('express');
const router = express.Router();
const universityController = require('../controllers/universityController');

// Khai báo tập hợp đường dẫn cho University
router.post('/', universityController.createUniversity);       // POST /api/universities
router.get('/', universityController.getAllUniversities);       // GET /api/universities
router.get('/:id', universityController.getUniversityById);    // GET /api/universities/:id
router.put('/:id', universityController.updateUniversity);     // PUT /api/universities/:id
router.delete('/:id', universityController.deleteUniversity);  // DELETE /api/universities/:id

module.exports = router;