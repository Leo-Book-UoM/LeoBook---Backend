const { query } = require('express');
const pool = require('../../config/dbConfig');

//Get count project is done but not submit project's reports (club secratary and project secretary both are not submitted)
const getNotReportedProjectCountToClubSecretary =  async(req , res) => {
    try {
        const query = `SELECT  COUNT ("projectId") AS "totalCount"
                        FROM public.projects
                        WHERE "projectReport" IS null
                        AND ("clubSecretaryStatus" IS NULL OR "clubSecretaryStatus" = B'0')
                        AND(
	                    (EXTRACT(DAY FROM CURRENT_DATE) <= 15
	                    AND "date" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
	                    AND "date" < DATE_TRUNC('month' , CURRENT_DATE))

	                    OR

                        (EXTRACT(DAY FROM CURRENT_DATE) > 15
                        AND "date" >= DATE_TRUNC('month', CURRENT_DATE) 
                        AND "date" < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month'))
                        )`
        const result = await pool.query(query);

        const totalCount = result.rows[0] ?.totalCount || 0;
        res.status(200).send(totalCount.toString());
    }catch(error){
        console.log("Error fetching not submitted project count:", error);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};

//Get count project is done and project secretary submited project's reports  (project secretary submitted but club secretary not submitted)
const getReportedProjectCountToClubSecretary =  async(req , res) => {
    try {
        const query = `SELECT  COUNT ("projectId") AS "totalCount"
                        FROM public.projects
                        WHERE "projectReport" IS NOT NULL
                        AND ("clubSecretaryStatus" IS NULL OR "clubSecretaryStatus" = B'0')
                        AND(
	                    (EXTRACT(DAY FROM CURRENT_DATE) <= 15
	                    AND "date" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
	                    AND "date" < DATE_TRUNC('month' , CURRENT_DATE))

	                    OR

                        (EXTRACT(DAY FROM CURRENT_DATE) > 15
                        AND "date" >= DATE_TRUNC('month', CURRENT_DATE) 
                        AND "date" < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month'))
                        )`
        const result = await pool.query(query);

        const totalCount = result.rows[0] ?.totalCount || 0;
        res.status(200).send(totalCount.toString());
    }catch(error){
        console.log("Error fetching not submitted project count:", error);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};

//Get count project is done and project secretary submited project's reports (club secretary submitted)
const getReportedProjectCountToDistrict =  async(req , res) => {
    try {
        const query = `SELECT  COUNT ("projectId") AS "totalCount"
                        FROM public.projects
                        WHERE "clubSecretaryStatus" = B'1'
                        AND(
	                    (EXTRACT(DAY FROM CURRENT_DATE) <= 15
	                    AND "date" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
	                    AND "date" < DATE_TRUNC('month' , CURRENT_DATE))

	                    OR

                        (EXTRACT(DAY FROM CURRENT_DATE) > 15
                        AND "date" >= DATE_TRUNC('month', CURRENT_DATE) 
                        AND "date" < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month'))
                        )`
        const result = await pool.query(query);

        const totalCount = result.rows[0] ?.totalCount || 0;
        res.status(200).send(totalCount.toString());
    }catch(error){
        console.log("Error fetching not submitted project count:", error);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};

//Get project at done at previous month
const getProjectCountAtPreviousMonth =  async(req , res) => {
    try {
        const query = `SELECT COUNT("projectId") AS "totalCount"
                        FROM public.projects
                        WHERE 
                            (
                                (EXTRACT(DAY FROM CURRENT_DATE) <= 15
                                AND "date" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
                                AND "date" < DATE_TRUNC('month', CURRENT_DATE))
                                
                                OR
                                
                                (EXTRACT(DAY FROM CURRENT_DATE) > 15
                                AND "date" >= DATE_TRUNC('month', CURRENT_DATE) 
                                AND "date" < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month'))
                            );`
        const result = await pool.query(query);

        const totalCount = result.rows[0] ?.totalCount || 0;
        res.status(200).send(totalCount.toString());
    }catch(error){
        console.log("Error fetching not submitted project count:", error);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};

module.exports={
    getNotReportedProjectCountToClubSecretary,
    getReportedProjectCountToClubSecretary,
    getReportedProjectCountToDistrict,
    getProjectCountAtPreviousMonth
}