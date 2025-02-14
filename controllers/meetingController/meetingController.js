const pool = require('../../config/dbConfig');

//create General meeting
const createGeneralMeeting = async (req, res) => {
    const { title, date, time, location, otherClubs } = req.body;
    const image = req.file ? req.file.filename : null;

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

        const imagePath = image ? `/uploads/${image}` : null;

        const query = `
            INSERT INTO public."generalMeetings" ("meetingName", date, "time", "otherClubs", location, image)  
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
        `;

        const values = [
            title,           
            date || null,
            validatedTime || null,
            otherClubs ? `{${otherClubs.join(',')}}` : null,
            location || null,
            imagePath || null,
        ];

        const result = await pool.query(query, values);
        res.status(201).json({ message: 'Meeting created successfully', meeting: result.rows[0] });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Fetch  past 11 month's general meetings
const getAllGeneralMeetings = async (req, res) => {
  try {
    const query = `
      WITH latest_meeting AS (
      SELECT * 
      FROM public."generalMeetings"
      WHERE "date" IS NOT NULL
      ORDER BY "date" DESC
      LIMIT 1 
    ),
    previous_10_months AS (
      SELECT * 
      FROM public."generalMeetings"
      WHERE "date" IS NOT NULL
      AND "date" >= date_trunc('month', CURRENT_DATE) - INTERVAL '10 months'
      ORDER BY "date" DESC
      LIMIT 10 
    )
    SELECT * FROM latest_meeting
    UNION ALL
    SELECT * FROM previous_10_months
    ORDER BY "date" DESC;`;

    const result = await pool.query(query);

    const projectWithImages = result.rows.map(project => {
      return {
        ...project,
        image: project.image ? `http://localhost:5000${project.image}`: null,
      };
    });
    res.status(200).json(projectWithImages);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

module.exports = { 
  createGeneralMeeting,
  getAllGeneralMeetings
 };