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
  // Destructure properties from the request body
  const { projectid, taskId, taskName, taskDescription, taskDate, markAsDone } = req.body;

  // Generate the current timestamp for createdDate
  const createdDate = new Date();

  try {
    // SQL query for inserting a new task
    const query = `
    INSERT INTO public."projectTimelines" 
    ("projectId", "taskId", "taskName", "taskDescription", "createdDate", "taskDate", "markAsDone") 
    VALUES ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING *;
  `;

    // Values for the query parameters
    const values = [
      projectid,
      taskId,
      taskName,
      taskDescription,
      createdDate,
      taskDate,
      markAsDone,
    ];

    // Execute the query
    const result = await pool.query(query, values);

    // Respond with success message and created task
    res.status(201).json({ message: 'Task Created successfully', task: result.rows[0] });
  } catch (err) {
    // Log detailed error information
    console.error('Error creating task:', err);

    // Respond with an error message
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

module.exports = {
  getAllProjects,
  getFilteredProjects,
  createProject,
  createTask
};
