const pool = require('../../config/dbConfig');

// Create General Meeting
const createGeneralMeeting = async (req, res) => {
  try {
      const { title, date, time, location } = req.body;
      const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

      let validatedTime = null;
      if (time) {
          if (/^\d{2}:\d{2}$/.test(time)) {
              validatedTime = `${time}:00`;
          } else {
              const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
              if (!timeRegex.test(time)) {
                  return res.status(400).json({ error: 'Invalid time format. Use HH:MM or HH:MM:SS' });
              }
              validatedTime = time;
          }
      }

      const query = `
          INSERT INTO public."generalMeetings" ("meetingName", date, "time", location, image)
          VALUES ($1, $2, $3, $4, $5) RETURNING *;
      `;

      const values = [
          title || null,
          date || null,
          validatedTime || null, // Use validatedTime here
          location || null,
          imagePath || null
      ];

      const result = await pool.query(query, values);
      res.status(201).json({ message: "Meeting created successfully", meeting: result.rows[0] });

  } catch (err) {
      console.error("Database Error:", err.message);
      res.status(500).json({ error: "Server Error" });
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
        AND "meetingId" NOT IN (SELECT "meetingId" FROM latest_meeting) 
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

//get the attendance of officers
const getaGMAttendance = async (req, res) => {
  const {meetingId} = req.params
  try{ 
  const query = `
  SELECT 
    o."officerId", 
    o."officerName", 
    o."designationName", 
    CASE 
        WHEN gm."meetingId" IS NOT NULL THEN TRUE 
        ELSE FALSE 
    END AS "participation"
    FROM public.officers o
    LEFT JOIN public."generalMeetings" gm 
    ON o."officerId" = ANY(gm.participants)
    AND gm."meetingId" = $1; `;

  const values = [meetingId];
  const result = await pool.query(query,values);
  res.status(200).json(result.rows);
}catch(error){
  console.error("Error fetching GM Attendance:", error);
  res.status(500).json({ error: 'Server Error', details: error.message });
}
}

//mark the attendance
const markAttendance = async (req, res) => {
  const { generalMeetingId } = req.params;
  const { participantsArr } = req.body;

  if (!Array.isArray(participantsArr) || participantsArr.length === 0) {
    return res.status(400).json({ error: "No participants to add" });
  }

  try {
    const query = `
      UPDATE public."generalMeetings"
      SET participants = $2
      WHERE "meetingId" = $1
      RETURNING participants;
    `;
    const values = [generalMeetingId, participantsArr];
    const result = await pool.query(query, values);
    res.status(200).json({
      message: "Attendance replaced successfully",
      updatedParticipants: result.rows[0].participants
    });
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
};


// Fetch  past 11 month's general meetings
const getAllGMsummary = async (req, res) => {
  try {
    const query = `
       SELECT "meetingId", "meetingName", "date"
      FROM public."generalMeetings"
      WHERE "date" IS NOT NULL
      ORDER BY "date" DESC
      LIMIT 11;`;

    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};


module.exports = { 
  createGeneralMeeting,
  getAllGeneralMeetings,
  getaGMAttendance,
  markAttendance,
  getAllGMsummary
 };