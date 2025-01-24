const pool = require('../../config/dbConfig');

// Fetch all projects
const getAllProjects = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.projects ORDER BY "projectid"');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Fetch filtered projects
const getFilteredProjects = async (req, res) => {
  const { projectName, category, date } = req.query;
  try {
    const query = `SELECT * FROM get_filtered_projects($1, $2, $3);`;
    const result = await pool.query(query, [projectName || null, category || null, date || null]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Create a new project
const createProject = async (req, res) => {
  const { projectid, projectname, date, time, venue, category, image, status, chairman, secretary, treasurer } = req.body;

  // Validation for required fields
  if (!projectid || !projectname || !date || !time || !venue || !category || status == null || !chairman || !secretary || !treasurer) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const query = `
      INSERT INTO public.projects (projectid, projectname, date, time, venue, category, image, status, chairman, secretary, treasurer)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;
    `;
    const values = [projectid, projectname, date, time, venue, category, image || null, status || 1, chairman, secretary, treasurer];
    
    const result = await pool.query(query, values);
    res.status(201).json({ message: 'Project created successfully', project: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

//create a new task

const createTask = async (req, res) => {
  const { projectid, taskId, taskName, taskDescription, taskDate, markAsDone, taskCatagory } = req.body;

  const createdDate = new Date();

  try {
    const query = `
    INSERT INTO public."projectTimelines" 
    ("projectId", "taskId", "taskName", "taskDescription", "createdDate", "taskDate", "markAsDone", "taskCatagory") 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
    RETURNING *;
  `;
    const values = [
      projectid,
      taskId,
      taskName,
      taskDescription,
      createdDate,
      taskDate,
      markAsDone,
      taskCatagory, 
    ];
    console.log('Inserting values:', values); 
    const result = await pool.query(query, values);

    res.status(201).json({ message: 'Task Created successfully', task: result.rows[0] });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

//get the task list according the projectId
const getTasksByProjetId = async (req, res) => {
  const { projectId } =req.params;

  try{
    const query = `SELECT * FROM public."projectTimelines" WHERE "projectId" =$1;`;

    const values = [projectId];
    console.log('Fetching tasks for projectId', projectId);

    const result = await pool.query(query, values);

    if(result.rows.length > 0) {
      res.status(200).json({ tasks: result.rows });
    } else {
      res.status(404).json({ message: 'No tasks found for the specified projectId' });
    }
  }catch (err) {
    console.err('Error fetching tasks:', err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

module.exports = {
  getAllProjects,
  getFilteredProjects,
  createProject,
  createTask,
  getTasksByProjetId
};
