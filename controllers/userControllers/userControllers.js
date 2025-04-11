const pool = require('../../config/dbConfig');

// Fetch all Users with optional name search
const getAllUsersNP = async (req, res) => {
  const search = req.query.search || '';
  try {
    const result = await pool.query(
      `SELECT "userId", "userName" 
       FROM public.users 
       WHERE TRIM(LOWER("userName")) ILIKE $1 AND "roleId" = 4
       ORDER BY "userId"`,
      [`%${search.trim().toLowerCase()}%`]
    );
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

//get user detailes according the userId
const getUserDetails = async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `SELECT u."userName", u."email", u."mobile", u."dob", u."addedAt", added_by_user."userName" AS "addedByName", u."image", o."designationName"
                   FROM public.users u
                  LEFT JOIN public.users added_by_user
                  ON u."addedBy" = added_by_user."userId"
                  LEFT JOIN public.officers o
                  ON u."userId" = o."officerId"
                  WHERE u."userId" = $1`;

    const values = [userId];

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: `No user found with userId: ${userId}` });
    }
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

//get user attendace for GMs
const getParticipatedGMs = async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `SELECT gm."meetingId"
                   FROM public."generalMeetings" gm
                   WHERE $1 = ANY(gm.participants)
                   ORDER BY "date" DESC;`;

    const values = [userId];

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    }
    else {
      res.status(404).json({ message: `No GMs found with userId: ${userId}` });
    }
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

//get user attendace for projects
const getUserProjectAttendance = async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `SELECT p."projectId", p."projectname", p."date"
                   FROM public."projects" p
                   WHERE $1 = ANY(p.attendance)
                   ORDER BY "date" DESC;`;

    const values = [userId];

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    }
    else {
      res.status(404).json({ message: `No projects found with userId: ${userId}` });
    }
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

// Fetch all Director project count
const getDirectorProjectCount = async (req, res) => {
    const { userId } = req.params;
    try {
      const query = `SELECT COUNT("projectId") 
                     FROM public.projects
                     WHERE date IS NOT NULL 
                     AND  "date" < CURRENT_DATE
                     AND "director" = $1;`;
  
      const values = [userId];
  
      const result = await pool.query(query, values);
  
      if (result.rows.length > 0) {
        res.status(200).json(result.rows[0]);
      }
      else {
        res.status(404).json({ message: `No projects found with userId: ${userId}` });
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      res.status(500).json({ error: 'Server Error', details: err.message });
    }
  };

  // Fetch all prospect project count
const getProspectProjectCount = async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `SELECT COUNT("projectId") 
                    FROM public.projects
                    WHERE date IS NOT NULL 
                    AND "date" < CURRENT_DATE
                    AND ("chairman" = $1
                    OR "secretary" = $1 
                    OR "treasure" = $1)`;

    const values = [userId];

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    }
    else {
      res.status(404).json({ message: `No projects found with userId: ${userId}` });
    }
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

  module.exports = {
    getAllUsersNP,
    getUserName,
    getUserDetails,
    getParticipatedGMs,
    getUserProjectAttendance,
    getDirectorProjectCount,
    getProspectProjectCount
  }