const pool = require("../../config/dbConfig");

//get district events on this month
const getThisMonthDiastrictEvents = async(req, res) => {
    try{
        const query = `
        SELECT ARRAY_AGG(DISTINCT "date") AS dates, 
        COUNT(*) AS eventCount,
        SUM(CASE WHEN "date" < CURRENT_DATE THEN 1 ELSE 0 END) AS doneEventCount
        FROM public."districtEvents"
        WHERE "date" IS NOT NULL
        AND EXTRACT(MONTH FROM "date") = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM "date") = EXTRACT(YEAR FROM CURRENT_DATE);
        `;
        const result = await pool.query(query);
        res.status(200).json({
            dates: result.rows[0].dates || [],
            eventCount: result.rows[0].eventcount || 0 ,
            doneEventCount: result.rows[0].doneeventcount || 0
        });
    } catch (err) {
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};

module.exports = {
    getThisMonthDiastrictEvents
}