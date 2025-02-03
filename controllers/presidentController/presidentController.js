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
        console.error('Error fetching task details:', err);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};


module.exports = {
    getProjectsCount,
    getTasksDetails
};
