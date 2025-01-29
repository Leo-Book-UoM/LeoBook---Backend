const pool = require('../../config/dbConfig');

// Fetch all Users
const getAllUsers = async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM public.users ORDER BY "userId"');
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server Error' });
    }
  };

  module.exports = {
    getAllUsers
  }