const pool = require('../../config/dbConfig');

//get project income detailes detailes
const getProjectBudgetDetailes = async (req, res) => {
    const  { projectId} = req.params;
    try {
        const query = `
            SELECT description, amount, bill,(SELECT SUM(amount) 
                FROM public."projectBudget" 
                WHERE "projectId" = $1) AS "totalAmount"
            FROM public."projectBudget"
            WHERE "projectId" = $1
            ORDER BY "budgetId" ASC; `;

        const result = await pool.query(query,[projectId]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: err.message || 'Server Error' });
    }
};

//add project budget detailes

const addBudgetDetails = async (req, res) => {
    const { projectId } = req.params;
    const { description, amount} = req.body;
    const bill = req.file ? req.file.filename : null;

    try {
        if (!description || !amount ) {
            return res.status(400).json({ error: "Description and amount are required" });
        }

        const updatedDate = new Date();

        const query = `
            INSERT INTO public."projectBudget" ("projectId", "description", "amount", bill, "updatedDate") 
            VALUES ($1, $2, $3,$4, $5) RETURNING *`;

        const { rows } = await pool.query(query, [projectId, description, amount, bill, updatedDate]);
        res.status(201).json(rows[0]);

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
    getProjectBudgetDetailes,
    addBudgetDetails,
    deleteBudgetDetailes
};
