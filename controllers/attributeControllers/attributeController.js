const pool = require('../../config/dbConfig');

//create attribute
const createAttribute = async (req, res) => {
    const { attributeName, directorId } = req.body;
  
    try {
  
      const query = `
        INSERT INTO public.projectAttributes (attributeName, directorId)  
        VALUES  ($1, $2) RETURNING *;
      `;
  
      const values = [
        attributeName,
        directorId || null,
      ];
  
      const result = await pool.query(query, values);
      res.status(201).json({ message: 'Attribute created successfully', attribute: result.rows[0] });
    } catch (err) {
      console.error('Database Error:', err.message);
      res.status(500).json({ error: 'Server Error' });
    }
  };

  //get attribute List
  const getAttributesList = async (req, res) => {
    try{
        const query = `
        SELECT "attributeId", "attributeName", "designationName", "officerName"
        FROM public."projectAttributes" pa
        LEFT JOIN public."officers" o
        ON pa."directorId" = o."officerId"
        ORDER BY "attributeId" ASC ;`
  
        const result = await pool.query(query);
          res.status(200).json(result.rows);
        } catch (err) {
          console.error(err.message);
          res.status(500).json({ error: 'Server Error' });
        }
  };

  //delete attribute
  const deleteAttribute = async (req, res) => {
    try {
        const { attributeId } = req.params;

        if(!attributeId) {
            return res.status(400).json({ error: "Attribute ID is required"});
        }

        const query = `
        DELETE FROM public."projectAttributes" WHERE "attributeId" = $1 RETURNING *;`;

        const values = [attributeId];

        const result = await pool.query(query, values);

        if(result.rowCount === 0) {
            return res.status(404).json({ error: "Attribute not found" });
        }

        res.status(200).json({ message: "attribute deleted successfully", deletedAttribute: result.rows[0] });
    }catch (err) {
        console.error("Database Error:",err.message);
        res.status(500).json({ error: "Server Error" });
    }
  };

module.exports = {
  createAttribute,
  getAttributesList,
  deleteAttribute
}