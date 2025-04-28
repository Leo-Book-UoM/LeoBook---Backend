const pool = require('../../config/dbConfig');

// Fetch all director positions that start with "director"
const getAllDirectorPositions = async (req, res) => {
  const search = req.query.search || '';
  try {
    const result = await pool.query(
      `SELECT "designationId", "designationName", "officerId" 
       FROM public.officers
       WHERE TRIM(LOWER("designationName")) LIKE 'director%' 
       ORDER BY "designationId"`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};


  module.exports = {
    getAllDirectorPositions,
  }