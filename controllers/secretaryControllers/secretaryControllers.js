const { query } = require('express');
const pool = require('../../config/dbConfig');

const getProjectReportingStatus = async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(*) FILTER (WHERE "projectReport" IS NULL 
                                 AND ("clubSecretaryStatus" IS NULL OR "clubSecretaryStatus" = B'0')) AS "notReportedToClubSecretary",
                
                COUNT(*) FILTER (WHERE "projectReport" IS NOT NULL 
                                 AND ("clubSecretaryStatus" IS NULL OR "clubSecretaryStatus" = B'0')) AS "reportedToClubSecretary",
                
                COUNT(*) FILTER (WHERE "clubSecretaryStatus" = B'1') AS "reportedToDistrict",

                COUNT(*) AS "totalProjectsPreviousMonth"

            FROM public.projects
            WHERE (
                (EXTRACT(DAY FROM CURRENT_DATE) <= 15
                AND "date" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
                AND "date" < DATE_TRUNC('month', CURRENT_DATE))
                
                OR
                
                (EXTRACT(DAY FROM CURRENT_DATE) > 15
                AND "date" >= DATE_TRUNC('month', CURRENT_DATE) 
                AND "date" < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month'))
            );
        `;

        const result = await pool.query(query);
        res.status(200).json(result.rows[0]);  
    } catch (error) {
        console.error("Error fetching project counts:", error);
        res.status(500).json({ error: 'Server Error', details: error.message });
    }
};

//Fetch General meeting participents counts
const getGMParticipents = async(req, res) => {
    try{
      const query = `
      SELECT 
         TO_CHAR(date, 'Month') AS month_name,
         array_length(participants, 1) AS participant_count
      FROM public."generalMeetings"
      WHERE "date" IS NOT NULL
        AND "date" >= date_trunc('month', CURRENT_DATE) - INTERVAL '10 months'
      ORDER BY "date";
      `
      const result = await pool.query(query);
      res.status(200).json(result.rows);
    }catch(error){
        console.error("Error fetching GM participents counts:", error);
        res.status(500).json({ error: 'Server Error', details: error.message });
    }
  }

const getPreviousMonthProjects = async (req, res) => {
    try{
        const query = `
        SELECT * 
        FROM public.projects
        WHERE(
        (EXTRACT(DAY FROM CURRENT_DATE) <= 15
        AND "date" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        AND "date" < DATE_TRUNC('month', CURRENT_DATE))

        OR

        (EXTRACT(DAY FROM CURRENT_DATE) > 15
        AND "date" >= DATE_TRUNC('month', CURRENT_DATE)
        AND "date" < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month'))
        );`

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

//previousmonth and non assigned projects
const getPreviousMonthProjectNames = async (req, res) => {
  try{
      const query = `
      SELECT p."projectId", p."projectname"
      FROM public.projects p
	  LEFT JOIN public."projectsAssignToAttributes" pa
	  ON p."projectId" = pa."projectId"
      WHERE(
      (EXTRACT(DAY FROM CURRENT_DATE) <= 15
      AND "date" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
      AND "date" < DATE_TRUNC('month', CURRENT_DATE))

      OR

      (EXTRACT(DAY FROM CURRENT_DATE) > 15
      AND "date" >= DATE_TRUNC('month', CURRENT_DATE)
      AND "date" < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month'))
      )
	  AND pa."projectId" IS NULL;`

      const result = await pool.query(query);
        res.status(200).json(result.rows);
      } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
      }
};


//previousmonth and assigned projects
const getPreviousMonthAssignedProjectNames = async (req, res) => {
  try{
      const query = `
      SELECT p."projectId", p."projectname"
      FROM public.projects p
	  LEFT JOIN public."projectsAssignToAttributes" pa
	  ON p."projectId" = pa."projectId"
      WHERE(
      (EXTRACT(DAY FROM CURRENT_DATE) <= 15
      AND "date" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
      AND "date" < DATE_TRUNC('month', CURRENT_DATE))

      OR

      (EXTRACT(DAY FROM CURRENT_DATE) > 15
      AND "date" >= DATE_TRUNC('month', CURRENT_DATE)
      AND "date" < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month'))
      )
	  AND pa."projectId" IS NULL;`

      const result = await pool.query(query);
        res.status(200).json(result.rows);
      } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
      }
};
const getAttributes = async (req, res) => {
  try{
      const query = `
      SELECT "attributeName" , "attributeId" 
      FROM public."projectAttributes"
      ORDER BY "attributeId" ASC ;`

      const result = await pool.query(query);
        res.status(200).json(result.rows);
      } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
      }
};

const markAttribute = async (req, res) => {
  const { projectId, attributeIds } = req.body;

  if (!projectId || !Array.isArray(attributeIds) || attributeIds.length === 0) {
    return res.status(400).json({ error: "Invalid projectId or attributes" });
  }

  try {
    const query = `
      INSERT INTO public."projectsAssignToAttributes" ("projectId", "attributeId")
      VALUES ($1, $2)
      RETURNING *;
    `;

    const values = [projectId, attributeIds];
    const result = await pool.query(query, values);

    if (!result.rows || result.rows.length === 0) {
      return res.status(201).json({
        message: "Attributes assigned successfully, but no data returned."
      });
    }

    res.status(201).json({
      message: "Attributes assigned successfully",
      assignedAttributes: result.rows[0] 
    });

  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
};

//get marked attributes
const getMarkedAttributes = async (req, res) => {
  try{
      const query = `
      SELECT 
        p."projectId", 
        p."projectname", 
        STRING_AGG(DISTINCT (a."attributeId")::TEXT, ', ') AS "attributeIds",  
        STRING_AGG(DISTINCT (a."attributeName"), ', ') AS "attributeNames"
      FROM public.projects p
      LEFT JOIN public."projectsAssignToAttributes" pa
      ON p."projectId" = pa."projectId"
      LEFT JOIN public."projectAttributes" a 
      ON a."attributeId" = ANY(pa."attributeId")
      WHERE 
    (
    (EXTRACT(DAY FROM CURRENT_DATE) <= 15
     AND p."date" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
     AND p."date" < DATE_TRUNC('month', CURRENT_DATE))

    OR

    (EXTRACT(DAY FROM CURRENT_DATE) > 15
     AND p."date" >= DATE_TRUNC('month', CURRENT_DATE)
     AND p."date" < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month'))
    )
    AND pa."projectId" IS NOT NULL
    GROUP BY p."projectId", p."projectname";`

      const result = await pool.query(query);
        res.status(200).json(result.rows);
      } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
      }
};

//delete assigned attributes
const deleteProjectsAssignToAttributes = async (req, res) => {
  const { projectId } = req.body;

  if(!projectId ) {
    return res.status(400).json({ error: "Invalid projetId"});
  }
  try {
    const query = `
    DELETE FROM public."projectsAssignToAttributes"
    WHERE "projectId" = $1 ;
    `;

    const values = [projectId];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Record not found"});
    }
    res.status(200).json({ message: "Record deleted successfully" });

  } catch (err) {
    console.error("Database error:", err.message);
    res.status(500).json({ error: "Server error"});
  }
};

//create district event
const createDiatrictEvent = async (req, res) => {
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
          INSERT INTO public."districtEvents" ("eventName", date, "time", location, image)
          VALUES ($1, $2, $3, $4, $5) RETURNING *;
      `;

      const values = [
          title || null,
          date || null,
          validatedTime || null, 
          location || null,
          imagePath || null
      ];

      const result = await pool.query(query, values);
      res.status(201).json({ message: "Event created successfully", meeting: result.rows[0] });

  } catch (err) {
      console.error("Database Error:", err.message);
      res.status(500).json({ error: "Server Error" });
  }
};


module.exports={
    getProjectReportingStatus,
    getPreviousMonthProjects,
    getGMParticipents,
    getPreviousMonthProjectNames,
    getAttributes,
    markAttribute,
    getPreviousMonthAssignedProjectNames,
    getMarkedAttributes,
    deleteProjectsAssignToAttributes,
    createDiatrictEvent
}