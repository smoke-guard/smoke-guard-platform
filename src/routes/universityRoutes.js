const express = require("express");
const universityController = require("../controllers/universityController");

const router = express.Router();

router.get("/", universityController.listUniversities);
router.get("/:id", universityController.getUniversity);
router.post("/", universityController.createUniversity);
router.put("/:id", universityController.updateUniversity);
router.delete("/:id", universityController.deleteUniversity);

module.exports = router;
