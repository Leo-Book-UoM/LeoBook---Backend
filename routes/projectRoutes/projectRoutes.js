const express = require('express');
const verifyToken = require('../../middleware/authmiddleware');
const upload  = require('../../middleware/upload');
const { getAllProjects, getFilteredProjects, createProject, createTask, getTasksByProjetId, deleteTaskById , editTask} = require('../../controllers/projectControllers/projectControllers');
const {getProjectBudgetDetailes, addBudgetDetails, deleteBudgetDetailes } = require('../../controllers/treasureControllers/projectTreasureControllers');
const { registerUser, loginUser, getAllUsers, authUser, logoutUser } = require('../../controllers/authController/authController');
const { refreshToken } = require('../../controllers/authController/refreshToken');
const { getAllUsersNP, getUserName } = require('../../controllers/userControllers/userControllers');
const { getProjectsCount, getTasksDetails, getprojectCountsForMonths, getupcommingProjects, getAttributesCount, getTreasureDetailes, getUpcommingProjectNames } = require('../../controllers/presidentController/presidentController');
const { getProjectReportingStatus, getPreviousMonthProjects} = require('../../controllers/secretaryControllers/secretaryControllers');
const { createGeneralMeeting, getAllGeneralMeetings } = require('../../controllers/meetingController/meetingController');

const router = express.Router();

// Routes for project operations
router.get('/api/projects', getAllProjects);
router.get('/api/projects/7', getFilteredProjects);
//router.post('/api/addproject',createProject);
router.post('/api/addproject',upload.single("image"), createProject);

// Route for project treasure operations
router.get('/api/getprojectBudget/:projectId', getProjectBudgetDetailes);
router.post('/api/addprojectBudget/:projectId', addBudgetDetails);
router.delete('/api/treasure',deleteBudgetDetailes);

// Route for task operations
router.post('/api/addtask', createTask);
router.get('/api/gettasks/:projectId', getTasksByProjetId);
router.delete('/api/deleteTask/:projectId/:taskId',deleteTaskById);
router.put('/api/editTask/:projectId/:taskId', editTask);

// Route for authentication operations
router.post('/api/register',registerUser);
router.post('/api/login', loginUser);
router.get('/api/authUser',authUser);
router.post('/api/logout',logoutUser);
router.post('/api/refresh',refreshToken);

//router.get('/api/getAllUsers', getAllUsersNP);

//Route for president operations
router.get('/api/getProjectsCount/:status', getProjectsCount);
router.get('/api/getTasksDetails', getTasksDetails);
router.get('/api/monthlyProjectCount',getprojectCountsForMonths);
router.get('/api/upcommingprojects',getupcommingProjects);
router.get('/api/attributeCounts',getAttributesCount);
router.get('/api/getTreasureDetailes',getTreasureDetailes);
router.get('/api/getUpcommingProjectNames',getUpcommingProjectNames);

//Route for secretary operations
router.get('/api/getProjectReportingStatus',getProjectReportingStatus);
router.get('/api/getLastMontProjects',getPreviousMonthProjects);

//Routes for meeting operations
router.post('/api/createGeneralMeeting',createGeneralMeeting);
router.get('/api/getAllGeneralMeetings',getAllGeneralMeetings);

// Route for user operations
router.get('/api/getAllUsers',verifyToken, getAllUsers);
router.get('/api/getUserNames/:roleName',getUserName);

module.exports = router;
