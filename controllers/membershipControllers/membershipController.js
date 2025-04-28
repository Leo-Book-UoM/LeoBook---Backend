const pool = require('../../config/dbConfig');

//add membership
const AddMember = async (req, res) => {
    try {
      const { memberName, memberType, myLCI, myLEO, dob, addDate } = req.body;
  
      const myLCIValue = myLCI ? 1 : 0;
      const myLEOValue = myLEO ? 1 : 0;
  
      const query = `
        INSERT INTO public."membership" ("memberName", "memberType", "myLCI", "myLEO", "dob", "addDate")
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
      `;
      const values = [
        memberName,
        memberType || null,
        myLCIValue,
        myLEOValue,
        dob || null,
        addDate || null,
      ];
  
      const result = await pool.query(query, values);
      res.status(201).json({ message: "Member added successfully", member: result.rows[0] });
  
    } catch (err) {
      console.error("Database Error:", err.message);
      res.status(500).json({ error: "Server Error" });
    }
  };
  
  //delete member
  const deleteMember = async (req, res) => {
    try {
        const { memberId } = req.params;

        if(!memberId) {
            return res.status(400).json({ error: "Member ID is required"});
        }

        const query = `
        DELETE FROM public."membership" WHERE "memberId" = $1 RETURNING *;`;

        const values = [memberId];

        const result = await pool.query(query, values);

        if(result.rowCount === 0) {
            return res.status(404).json({ error: "Member not found" });
        }

        res.status(200).json({ message: "Member deleted successfully", deletedMember: result.rows[0] });
    }catch (err) {
        console.error("Database Error:",err.message);
        res.status(500).json({ error: "Server Error" });
    }
  };

  // Fetch all members
const getAllMembers = async (req, res) => {
    try {
      const query = `
        SELECT * FROM public.membership
        ORDER BY "addDate" DESC `;
  
      const result = await pool.query(query);
  
      const projectWithImages = result.rows.map(project => {
        return {
          ...project,
        };
      });
      res.status(200).json(projectWithImages);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server Error' });
    }
  };

  //get membership counts
const getMembershipCounts = async(req, res) => {
    try{
        const query = `
        SELECT 
        COUNT (*) AS "membership",
        COUNT(CASE WHEN "memberType" = 1 THEN 1 END) AS "boardMemberCount",
        COUNT(CASE WHEN "memberType" = 2 THEN 1 END) AS "otherMemberCount",
        COUNT(CASE WHEN "memberType" = 3 THEN 1 END) AS "newLeosCount"
        FROM public."membership";
        `;
        const result = await pool.query(query);
        res.status(200).json({
            membership: result.rows[0].membership || 0,
            boardMemberCount: result.rows[0].boardMemberCount || 0 ,
            otherMemberCount: result.rows[0].otherMemberCount || 0 ,
            newLeosCount: result.rows[0].newLeosCount || 0
        });
    } catch (err) {
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
};

  module.exports = {
    AddMember,
    getMembershipCounts,
    getAllMembers,
    deleteMember
  };