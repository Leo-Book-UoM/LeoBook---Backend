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

module.exports = {
    getProjectsCount
};
