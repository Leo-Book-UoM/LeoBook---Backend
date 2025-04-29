const pool = require('../../config/dbConfig');
const crypto = require('crypto');
const nodemailer = require('nodemailer')

// Function to generate random password
const generateRandomPassword = (length = 10) => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';

  let password = '';

  // Ensure at least one letter, one number, and one special character
  password += letters.charAt(Math.floor(Math.random() * letters.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));

  // Fill the rest with random characters from all combined
  const allChars = letters + numbers + specialChars;
  for (let i = 3; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Shuffle password so guaranteed characters aren't always in the same position
  return password
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
};


// Create transporter for sending email (adjust this config)
const transporter = nodemailer.createTransport({
  service: 'Gmail', // or use 'smtp.yourdomain.com'
  auth: {
    user: 'pramodhaldp.21@itfac.mrt.ac.lk',    // your email
    pass: 'vwcw xodh ixxt sedj',     // your email password (or app password if using Gmail)
  },
});

// Add new user function
const addUser = async (req, res) => {
  const { userName, email, mobile, dob, addedBy, image } = req.body;

  try {
    // Step 1: Generate random password
    const password = generateRandomPassword(8);

    // Step 2: Insert user into the database
    const insertQuery = `
      INSERT INTO public.users ("userName", "email", "mobile", "dob", "addedBy", "image", "password", "addedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING "userId", "userName", "email"
    `;
    const values = [userName, email, mobile, dob, addedBy, image, password];

    const result = await pool.query(insertQuery, values);

    const newUser = result.rows[0];

    // Step 3: Send email with password
    const mailOptions = {
      from: '"Leo book" pramodhaldp.21@itfac.mrt.ac.lk',
      to: newUser.email,
      subject: 'Your Account Details',
      text: `Hello ${newUser.userName},\n\nYour account has been created.\n\nYour temporary password is: ${password}\n\nPlease log in and change your password.\n\nThank you!`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'User created and password sent via email.', user: newUser });
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

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

//uplord or update profile pic

const uploadUserProfilePic = async (req, res) => {
  const { userId } = req.params;

  if (!req.file || !req.file.path) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  const imageUrl = req.file.path; // Cloudinary image URL

  try {
    const query = `
      UPDATE public.users
      SET "image" = $1
      WHERE "userId" = $2
      RETURNING *;
    `;
    const values = [imageUrl, userId];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      user: result.rows[0],
      imageUrl,
    });
  } catch (error) {
    console.error('Database Error:', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

  module.exports = {
    getAllUsersNP,
    getUserName,
    getUserDetails,
    getParticipatedGMs,
    getUserProjectAttendance,
    getDirectorProjectCount,
    getProspectProjectCount,
    uploadProfilePic,
    addUser
  }