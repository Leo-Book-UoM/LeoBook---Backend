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
const getFilteredProjects = async (req, res) => {
  const { projectName, category, date } = req.query;
  try {
    const query = `SELECT * FROM get_filtered_projects($1,$2,$3);`;
    const result = await pool.query(query, [projectName || null, category || null, date || null]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

module.exports = {
  getAllProjects,
  getFilteredProjects
};
