const express = require('express');
const { getAllProjects, getFilteredProjects } = require('../../controllers/projectControllers/projectControllers');
const {getBudgetDetailes, addBudgetDetails } = require('../../controllers/treasureControllers/projectTreasureControllers');

const router = express.Router();

// Route to get all projects
router.get('/api/projects', getAllProjects);
router.get('/api/projects/7', getFilteredProjects);
router.get('/api/treasure', getBudgetDetailes);
router.post('/api/treasure', addBudgetDetails);

module.exports = router;
