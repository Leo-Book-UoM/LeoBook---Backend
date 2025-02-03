const pool = require('../../config/dbConfig');

// Get project count by status
const getProjectsCount = async (req, res) => {
    const { status } = req.params; // Extract status from URL parameters

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
            COUNT(CASE WHEN pt."markAsDone" = B'0' THEN 1 END) AS pendingTasks,
            COUNT(pt."taskId") AS totalTasks,
            COUNT(CASE WHEN pt."taskDate" < CURRENT_DATE AND pt."markAsDone" = B'0' THEN 1 END) AS timeoutTasks
        FROM 
            public."projectTimelines" pt 
        LEFT JOIN 
            public."projects" p ON p.projectid = pt."projectId"
        WHERE 
            p.status = 1;
        `;

        const result = await pool.query(query);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};

//get project counts according months
const getprojectCountsForMonths = async (req, res) => {
    try {
        const query = `
            SELECT 
            TO_CHAR(date, 'Month') AS month_name,  -- Convert month number to month name
            EXTRACT(MONTH FROM date) AS month_number, -- Extract month number for ordering
            COUNT(*) AS project_count
            FROM Public.projects
            WHERE date IS NOT NULL
            GROUP BY month_name, month_number
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
        SELECT 
            COUNT(*) AS attribute_count, 
            COUNT(CASE WHEN "status" = true THEN 1 END) AS done_attribute_count
        FROM public."projectAttributes";
        `;

        const result = await pool.query(query);
        res.status(200).json(result.rows[0]); // Send only the first row
    } catch (err) {
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};


module.exports = {
    getProjectsCount,
    getTasksDetails,
    getprojectCountsForMonths,
    getupcommingProjects,
    getAttributesCount
};
