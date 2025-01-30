const express = require('express');
const { getAllProjects, getFilteredProjects, createProject, createTask, getTasksByProjetId, deleteTaskById , editTask} = require('../../controllers/projectControllers/projectControllers');
const {getBudgetDetailes, addBudgetDetails, deleteBudgetDetailes } = require('../../controllers/treasureControllers/projectTreasureControllers');
const { registerUser, loginUser, getAllUsers } = require('../../controllers/authController/authController');
const verifyToken = require('../../middleware/authmiddleware');
const { refreshAccessToken } = require('../../controllers/authController/refreshToken');
const { getAllUsersNP } = require('../../controllers/userControllers/userControllers');

const router = express.Router();

// Routes for project operations
router.get('/api/projects', getAllProjects);
router.get('/api/projects/7', getFilteredProjects);
router.post('/api/addproject',createProject);

// Route for treasure operations
router.get('/api/treasure', getBudgetDetailes);
router.post('/api/treasure', addBudgetDetails);
router.delete('/api/treasure',deleteBudgetDetailes);

// Route for task operations
router.post('/api/addtask', createTask);
router.get('/api/gettasks/:projectId', getTasksByProjetId);
router.delete('/api/deleteTask/:projectId/:taskId',deleteTaskById);
router.put('/api/editTask/:projectId/:taskId', editTask);

// Route for authentication operations
router.post('/api/register',registerUser);
router.post('/api/login', loginUser);
router.post('/refresh',refreshAccessToken);

//router.get('/api/getAllUsers', getAllUsersNP);

// Route for user operations
router.get('/api/getAllUsers',verifyToken, getAllUsers);
module.exports = router;
