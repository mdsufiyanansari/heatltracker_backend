const express = require("express");
const { createWorkoutPlan } = require("../controllers/aiController");

const router = express.Router();

router.post("/generate-plan", createWorkoutPlan);

module.exports = router;