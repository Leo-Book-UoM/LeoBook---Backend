const pool = require('../../config/dbConfig');

const getBudgetDetailes = async (req, res) => {
    try {
        console.log("Fetching budget details...");
        const result = await pool.query('SELECT * FROM public."budgetRepotDetailes" ORDER BY "itemId"');
        console.log("Query successful:", result.rows);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: err.message || 'Server Error' });
    }
};

const addBudgetDetails = async (req, res) => {
    const { date, description, quantity, rate } = req.body;
    const amount = parseFloat(quantity) * parseFloat(rate);

    try {
        const result = await pool.query(
            `INSERT INTO public."budgetRepotDetailes" ("date", "description", "queantity", "price", "amount")
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [date, description, quantity, rate, amount]
        );
        console.log("Budget detail added:", result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error adding budget detail:", err);
        res.status(500).json({ error: err.message || 'Failed to add budget detail' });
    }
};

const deleteBudgetDetailes = async(req, res) => {
    const {id} = req.params;
    
}

module.exports = {
    getBudgetDetailes,
    addBudgetDetails
};
