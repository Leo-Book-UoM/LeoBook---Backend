const pool = require("../../config/dbConfig");

//get district events on this month
const getThisMonthDiastrictEvents = async(req, res) => {
    try{
        const query = `
        SELECT ARRAY_AGG(DISTINCT "date") AS dates, COUNT(*) AS eventCount
        FROM public."districtEvents"
        WHERE "date" IS NOT NULL
        AND EXTRACT(MONTH FROM "date") = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM "date") = EXTRACT(YEAR FROM CURRENT_DATE);
        `;
        const result = await pool.query(query);
        res.status(200).json({
            dates: result.rows[0].dates || [],
            EventCount: result.rows[0].EventCount || 0
        });
    } catch (err) {
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};

module.exports = {
    getThisMonthDiastrictEvents
}