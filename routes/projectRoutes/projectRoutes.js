const express = require('express');
const verifyToken = require('../../middleware/authmiddleware');
const upload  = require('../../middleware/upload');
const { getAllProjects, getFilteredProjects, createProject, createTask, getTasksByProjetId, deleteTaskById , editTask, getUserProjects} = require('../../controllers/projectControllers/projectControllers');
const {getProjectBudgetDetailes, addBudgetDetails, deleteBudgetDetailes } = require('../../controllers/treasureControllers/projectTreasureControllers');
const { registerUser, loginUser, getAllUsers, authUser, logoutUser } = require('../../controllers/authController/authController');
const { refreshToken } = require('../../controllers/authController/refreshToken');
const { getAllUsersNP, getUserName, getUserDetails, getParticipatedGMs, getUserProjectAttendance, getDirectorProjectCount, getProspectProjectCount, uploadProfilePic } = require('../../controllers/userControllers/userControllers');
const { getProjectsCount, getTasksDetails, getprojectCountsForMonths, getupcommingProjects, getAttributesCount, getTreasureDetailes, getUpcommingProjectNames } = require('../../controllers/presidentController/presidentController');
const { getProjectReportingStatus, getPreviousMonthProjects, getGMParticipents, getPreviousMonthProjectNames, getAttributes, markAttribute, getPreviousMonthAssignedProjectNames, getMarkedAttributes, deleteProjectsAssignToAttributes, createDiatrictEvent} = require('../../controllers/secretaryControllers/secretaryControllers');
const { createGeneralMeeting, getAllGeneralMeetings, getaGMAttendance, markAttendance, getAllGMsummary, getupcommingMeetings } = require('../../controllers/meetingController/meetingController');
const { getThisMonthDiastrictEvents } = require('../../controllers/destrictEventController/districtEventController');
const { AddMember, getMembershipCounts, getAllMembers, deleteMember } = require('../../controllers/membershipControllers/membershipController');
const { uploadProjectReport, getAllProjectReport, getProjectReport, uploadProjectProposels, getProjectProposal, getLastMonthProjectReport} = require('../../controllers/reportControllers/reportControllers');
const { getAllDirectorPositions } = require('../../controllers/officerControllers/officerController');

const router = express.Router();

// Routes for project operations
router.get('/api/projects', getAllProjects);
router.get('/api/projects/7', getFilteredProjects);
router.post('/api/addproject',upload.single("image"), createProject);
router.get('/api/getUserProjects/:userId',getUserProjects);

// Route for project treasure operations
router.get('/api/getprojectBudget/:projectId', getProjectBudgetDetailes);
router.post('/api/addprojectBudget/:projectId', upload.single('bill'),addBudgetDetails);
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

router.get('/api/getAllUsers', getAllUsersNP);

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
router.get('/api/getGMParticipentsCount',getGMParticipents);
router.get('/api/getPreviousMonthProjectNames',getPreviousMonthProjectNames);
router.get('/api/getPreviousMonthAssignedProjectNames',getPreviousMonthAssignedProjectNames);

//Routes for Project attribute operations
router.get('/api/getAttributes',getAttributes);
router.get('/api/getMarkedAttributes',getMarkedAttributes);
router.post('/api/markAttribute',markAttribute);
router.delete('/api/deleteAssigning',deleteProjectsAssignToAttributes);

//Routes for event operations
router.post('/api/createEvent',upload.single("image"),createDiatrictEvent);
router.get('/api/getMonthDistrictEvent',getThisMonthDiastrictEvents);

//Routes for meeting operations
router.post('/api/createGeneralMeeting',upload.single("image"),createGeneralMeeting);
router.get('/api/getAllGeneralMeetings',getAllGeneralMeetings);
router.get('/api/getGMAttendance/:meetingId',getaGMAttendance);
router.patch('/api/markAttendance/:generalMeetingId',markAttendance);
router.get('/api/upcommingMeetings',getupcommingMeetings);

//Routes for membership operations
router.post('/api/addMember',AddMember);
router.get('/api/getMembershipCounts',getMembershipCounts);
router.get('/api/getAllMembers',getAllMembers);

// Route for user operations
router.get('/api/getAllUsers',verifyToken, getAllUsers);
router.get('/api/getUserNames/:roleName',getUserName);
router.get('/api/getUserDetails/:userId',getUserDetails);
router.delete('/api/dropMember/:memberId',deleteMember);

// Route for reporting operations
router.patch('/api/report/:projectId', upload.single("report"), uploadProjectReport );
router.get('/api/getAllreports', getAllProjectReport);
router.get('/api/getReport/:projectId', getProjectReport);
router.patch('/api/setProposal/:projectId', uploadProjectProposels);
router.get('/api/getProposal/:projectId', getProjectProposal);
router.get('/api/lastMonthProjectReports', getLastMonthProjectReport);

// Routes for officer profile operations
router.get('/api/getDerectorPositions',getAllDirectorPositions);
router.get('/api/getParticipatedGMs/:userId',getParticipatedGMs);
router.get('/api/getAllGMdetails',getAllGMsummary);
router.get('/api/getUserProjectAttendance/:userId',getUserProjectAttendance);
router.get('/api/directorProjectCount/:userId',getDirectorProjectCount);
router.get('/api/prospectProjectCount/:userId',getProspectProjectCount);
router.patch('/api/updateProPic/:userId',upload.single("image"),uploadProfilePic);

module.exports = router;