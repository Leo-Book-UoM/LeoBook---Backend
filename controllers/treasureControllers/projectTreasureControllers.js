const pool = require('../../config/dbConfig');

//get project income detailes detailes
const getProjectBudgetDetailes = async (req, res) => {
    const  { projectId} = req.params;
    try {
        const query = `
            SELECT description , amount
            FROM public."projectBudget"
            WHERE "projectId" = $1
            ORDER BY "budgetId" ASC  `;

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
    const { description } = req.body;

    try {
        if (!description || !Array.isArray(description)) {
            return res.status(400).json({ error: "Description must be an array" });
        }

        const descriptionJSONB = JSON.stringify(description); 
        const totalAmount = description.reduce((sum, item) => sum + parseFloat(item.amount), 0);

        const query = `
            INSERT INTO public."projectBudget" ("projectId", "description", "amount") 
            VALUES ($1, $2::jsonb, $3) RETURNING *`;

        const { rows } = await pool.query(query, [projectId, descriptionJSONB, totalAmount]);
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
