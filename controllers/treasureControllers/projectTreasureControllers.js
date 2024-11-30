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

const deleteBudgetDetailes = async (req, res) => {
    const { id } = req.query; 
    if (!id) {
        return res.status(400).json({ message: 'ID is required' });
    }

    try {
        const deleteRow = await pool.query(`DELETE FROM public."budgetRepotDetailes" WHERE "itemId" = $1 RETURNING *`, [id]);
        
        if (deleteRow.rows.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }

        console.log('Item deleted:', deleteRow.rows[0]);
        res.status(200).json({ message: 'Item deleted successfully', deleteRow: deleteRow.rows[0] });
    } catch (error) {
        console.error("Error deleting item:", error);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = {
    getBudgetDetailes,
    addBudgetDetails,
    deleteBudgetDetailes
};
