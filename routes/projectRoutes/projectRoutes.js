const express = require('express');
const { getAllProjects, getFilteredProjects, createProject, createTask } = require('../../controllers/projectControllers/projectControllers');
const {getBudgetDetailes, addBudgetDetails, deleteBudgetDetailes } = require('../../controllers/treasureControllers/projectTreasureControllers');

const router = express.Router();

// Route to get all projects
router.get('/api/projects', getAllProjects);
router.get('/api/projects/7', getFilteredProjects);
router.post('/api/addproject',createProject);
router.get('/api/treasure', getBudgetDetailes);
router.post('/api/treasure', addBudgetDetails);
router.delete('/api/treasure',deleteBudgetDetailes);
router.post('/api/addtask', createTask);

module.exports = router;
