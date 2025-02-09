const pool = require('../../config/dbConfig');

// Fetch all Users
const getAllUsersNP = async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM public.users ORDER BY "userId"');
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server Error' });
    }
  };

//get user Names according the roles
const getUserName = async (req, res) => {
  const { roleName } = req.params;
  try {
    const query = `
      SELECT u."userName" 
      FROM public.users u
      JOIN public.roles r
      ON u."roleId" = r."roleId"
      WHERE r."roleName" = $1
      ORDER BY u."userId" ASC;`;

    const values = [roleName];

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      res.status(200).json(result.rows );
    } else {
      res.status(404).json({ message: `No users found for role: ${roleName}` });
    }
  } catch (err) {
    console.error('Error fetching user names:', err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

  module.exports = {
    getAllUsersNP,
    getUserName
  }