const pool = require('../../config/dbConfig');

// Fetch all ongoing projects
const getAllProjects = async (req, res) => {
  try {
    const query = `
      SELECT * 
      FROM public.projects
      WHERE date IS NOT NULL 
      AND  "date" > CURRENT_DATE
      ORDER BY "date"`;

    const result = await pool.query(query);

    const projectWithImages = result.rows.map(project => {
      return {
        ...project,
        image: project.image ? `http://localhost:5000/uploads/${project.image}`: null,
      };
    });
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

// create project
const createProject = async (req, res) => {
  const { title, date, time, location, category, image, status, chairman, secretary, treasurer } = req.body;

  try {
    let validatedTime = null;

    if (time) {
      if (/^\d{2}:\d{2}$/.test(time)) {
        validatedTime = `${time}:00`;
      } else {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
        if (!timeRegex.test(time)) {
          return res.status(400).json({ error: 'Invalid time format. Use HH:MM:SS' });
        }
        validatedTime = time;
      }
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const query = `
      INSERT INTO public.projects (projectname, date, "time", venue, category, image, status, chairman, secretary, treasure)  
      VALUES  ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;
    `;

    const values = [
      title,
      date || null,
      validatedTime || null,
      location || null,
      category || null,
      imagePath || null,
      status || 1,
      chairman || null,
      secretary || null,
      treasurer || null
    ];

    const result = await pool.query(query, values);
    res.status(201).json({ message: 'Project created successfully', project: result.rows[0] });
  } catch (err) {
    console.error('Database Error:', err.message);
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

const deleteTaskById = async (req, res) => {
  const { projectId,taskId } = req.params;

  try{
    const query = `DELETE FROM public."projectTimelines" 
                  WHERE "projectId" = $1 AND "taskId" = $2
                  RETURNING *;`;
    const values = [projectId,taskId];

    console.log('Deleting task with projectId:', projectId, 'taskId:', taskId);

    const result = await pool.query(query, values);

    if(result.rowCount > 0){
      res.status(200).json({message:'Task deleted successfully', task: result.rows[0] });
    } else{
      res.status(404).json({ message: 'No task found with the taskId'});
    }
  } catch(err){
    console.error('Error deleting task:',err);
    res.status(500).json({ error: 'Server Error', details: err.message});
  }
};

const editTask = async (req, res) => {
  const { projectId, taskId } = req.params; // Get the projectId and taskId from the URL parameters
  const { taskName, taskDescription, taskDate, markAsDone, taskCatagory } = req.body; // Updated task details

  try {
    // Ensure at least one field is provided to update
    if (!taskName && !taskDescription && !taskDate && markAsDone == null && !taskCatagory) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }

    // Build the dynamic query
    const updates = [];
    const values = [];

    if (taskName) {
      updates.push(`"taskName" = $${updates.length + 1}`);
      values.push(taskName);
    }
    if (taskDescription) {
      updates.push(`"taskDescription" = $${updates.length + 1}`);
      values.push(taskDescription);
    }
    if (taskDate) {
      updates.push(`"taskDate" = $${updates.length + 1}`);
      values.push(taskDate);
    }
    if (markAsDone != null) {
      updates.push(`"markAsDone" = $${updates.length + 1}`);
      values.push(markAsDone);
    }
    if (taskCatagory) {
      updates.push(`"taskCatagory" = $${updates.length + 1}`);
      values.push(taskCatagory);
    }

    // Add projectId and taskId to the query values
    values.push(projectId, taskId);

    const query = `
      UPDATE public."projectTimelines"
      SET ${updates.join(', ')}
      WHERE "projectId" = $${values.length - 1} AND "taskId" = $${values.length}
      RETURNING *;
    `;

    console.log('Updating task with:', values);

    const result = await pool.query(query, values);

    if (result.rowCount > 0) {
      res.status(200).json({ message: 'Task updated successfully', task: result.rows[0] });
    } else {
      res.status(404).json({ message: 'Task not found for the specified projectId and taskId' });
    }
  } catch (err) {
    console.error('Error editing task:', err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};


module.exports = {
  getAllProjects,
  getFilteredProjects,
  createProject,
  createTask,
  getTasksByProjetId,
  deleteTaskById,
  editTask,
};
