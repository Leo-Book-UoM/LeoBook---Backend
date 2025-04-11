const pool = require('../../config/dbConfig');

// Fetch all director positions with optional search
const getAllDirectorPositions = async (req, res) => {
    const search = req.query.search || '';
    try {
      const result = await pool.query(
        `SELECT "designationId", "designationName", "officerId" 
         FROM public.officers
         WHERE "designationId" BETWEEN 1 AND 19
            AND TRIM(LOWER("designationName")) ILIKE $1 
         ORDER BY "designationId"`,
        [`%${search.trim().toLowerCase()}%`]
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