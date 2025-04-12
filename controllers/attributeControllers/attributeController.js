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