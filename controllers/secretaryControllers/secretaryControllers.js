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

const getPreviousMonthProjectNames = async (req, res) => {
  try{
      const query = `
      SELECT "projectId", "projectname" 
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
        res.status(200).json(result.rows);
      } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
      }
};

const getAttributes = async (req, res) => {
  try{
      const query = `
      SELECT "attributeName" , "projectId"
      FROM public."projectAttributes"
      ORDER BY "attributeId" ASC ;`

      const result = await pool.query(query);
        res.status(200).json(result.rows);
      } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
      }
};

//set the project attributes
const markAttribute = async (req, res) => {
  const { attributeId } = req.params;
  const { projectArr } = req.body;

  if (!Array.isArray(projectArr) || projectArr.length === 0) {
    return res.status(400).json({ error: "No attribute to add" });
  }

  try {
    const query = `
      UPDATE public."projectAttributes"
      SET "projectId" = $1
      WHERE "attributeId" = $2
      RETURNING "projectId";
    `;
    const values = [projectArr, attributeId];
    const result = await pool.query(query, values);
    res.status(200).json({
      message: "Attribute created successfully",
      updatedProjects: result.rows[0].projects
    });
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
    markAttribute
}