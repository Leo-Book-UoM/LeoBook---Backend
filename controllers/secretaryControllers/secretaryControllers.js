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

// module.exports = { getProjectCounts };


module.exports={
    // getNotReportedProjectCountToClubSecretary,
    // getReportedProjectCountToClubSecretary,
    // getReportedProjectCountToDistrict,
    // getProjectCountAtPreviousMonth
    getProjectReportingStatus
}