const pool = require('../../config/dbConfig');

// Get project count by status
const getProjectsCount = async (req, res) => {
    const { status } = req.params;

    if(!status) {
        return res.status(400).json({ error: "Status parameter is required"});
    }

    try {
        const query = `SELECT COUNT(*) AS total FROM public."projects" WHERE "status" = $1;`;
        const result = await pool.query(query, [status]);

            res.status(200).send(result.rows[0].total.toString() );
    } catch (err) {
        console.error('Error fetching project count:', err);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};

// Tasks details
const getTasksDetails = async (req, res) => {
    try {
        const query = `
       SELECT 
       COUNT(CASE WHEN pt."markAsDone" = B'0' THEN 1 END) AS "pendingTasks",
       COUNT(CASE WHEN  pt."markAsDone" = B'1' THEN 1 END) AS "doneTasks",
       COUNT(CASE WHEN pt."taskDate" < CURRENT_DATE AND pt."markAsDone" = B'0' THEN 1 END) AS "timeoutTasks"
       FROM public."projectTimelines" pt
       WHERE pt."projectId" IN (SELECT p."projectId" FROM public."projects" p WHERE p."status" = 1);`;

        const result = await pool.query(query);
        res.status(200).json([result.rows[0]]);
    } catch (err) {
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};

//get project counts according months
const getprojectCountsForMonths = async (req, res) => {
    try {
        const query = `
            SELECT 
                TO_CHAR(date, 'Month') AS month_name,  
                EXTRACT(YEAR FROM date) AS year,
                EXTRACT(MONTH FROM date) AS month_number,
                COUNT(*) AS project_count
            FROM Public.projects
            WHERE date IS NOT NULL
            GROUP BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date), TO_CHAR(date, 'Month')
            ORDER BY year DESC, month_number;
        `;

        const result = await pool.query(query);
        const allMonthCounts = result.rows.map(row => ({
            month_name: row.month_name.trim(), 
            month_number: row.month_number,
            project_count: row.project_count
        }));

        const currentMonth = new Date().getMonth() + 1;
        const thisMonthCount = allMonthCounts.find(month => 
            parseInt(month.month_number) === currentMonth
        );

        res.status(200).json({
            allMonthCounts,
            thisMonthCount
        });
    } catch (err) {
        res.status(500).json({ error: "server error", details: err.message });
    }
};

//get upcomming project on month
const getupcommingProjects = async(req, res) => {
    try{
        const query = `
        SELECT 
        COUNT(*) AS project_count FROM Public.projects
        WHERE date IS NOT NULL 
        AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE);
        `;
        const result = await pool.query(query);
        res.status(200).send(result.rows[0].project_count.toString());
    } catch (err) {
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};

//get attribute counts
const getAttributesCount = async (req, res) => {
    try {
        const query = `
        SELECT COUNT(*) AS attribute_count,
	    COUNT(paa."projectId") AS done_attribute_count
        FROM public."projectAttributes" pat
        LEFT JOIN  (
			SELECT  DISTINCT "projectId", unnest ("attributeId") AS "attributeId"
			FROM public."projectsAssignToAttributes") paa
        ON pat."attributeId" =paa."attributeId";
        `;

        const result = await pool.query(query);
        res.status(200).json(result.rows[0]); 
    } catch (err) {
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};

//Get treasure detailes
const getTreasureDetailes = async(req, res) => {
    try{
        const query =`
        SELECT 
        "month", TO_CHAR(month, 'Month') AS month_name,"total_income", "total_expenses","total_current_accets"
        FROM public.treasuries
        ORDER BY "month" ASC;
        `;
        const result = await pool.query(query);
        const allMonthTreasures = result.rows.map (row => ({
            month_name: row.month_name.trim(),
            total_income: parseFloat(row.total_income.replace(/[$,]/g, '')).toFixed(2),
            total_expenses: parseFloat(row.total_expenses.replace(/[$,]/g, '')).toFixed(2),
            total_current_accets: parseFloat(row.total_current_accets.replace(/[$,]/g,'')).toFixed(2)
        }));

        const currentMonth = new Date().toLocaleDateString('en-us', {month: 'long'});
        console.log(currentMonth)
        const currentMonthTreasures = allMonthTreasures.find(month =>
            (month.month_name) === currentMonth
        );
        res.status(200).json({
            allMonthTreasures,
            currentMonthTreasures
        })
    }catch (err) {
        res.status(500).json({ error: "server error", details: err.message });
    };
 }

// Get  upcomming projects name
const getUpcommingProjectNames = async (req, res) => {
    try {
        const query = `SELECT "projectname" , "date", "time" FROM public."projects" WHERE "status" = 1;`;
        const result = await pool.query(query);

        res.status(200).send(result.rows );
    } catch (err) {
        console.error('Error fetching project count:', err);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};

module.exports = {
    getProjectsCount,
    getTasksDetails,
    getprojectCountsForMonths,
    getupcommingProjects,
    getAttributesCount,
    getTreasureDetailes,
    getUpcommingProjectNames
};
