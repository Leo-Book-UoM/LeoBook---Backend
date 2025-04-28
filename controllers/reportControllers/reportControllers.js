const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload');
const pool = require('../../config/dbConfig');

//uplord or update project report

const uploadProjectReport = async (req, res) => {
    const { projectId } = req.params;

    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    const pdfPath = `/uploads/${req.file.filename}`;

    try {
        const query = `
        UPDATE public.projects
        SET "projectReport" = $1
        WHERE "projectId" = $2
        RETURNING *;
        `;
        const values = [pdfPath, projectId];

        const result = await pool.query(query, values);
    
        if (result.rows.length === 0) {
          return res.status(404).json({ error: "Project not found" });
        }
        res.status(200).json({
            message: 'Project report uploaded successfully',
            project: result.rows[0],
            reportLink: pdfPath
        });
    } catch (error) {
        console.error('Database Error:',error.message);
        res.status(500).json({ error: 'Server Error'});
}
};

//get all projet reports
const getAllProjectReport = async (req, res) => {
    try {
        const query = `
        SELECT "projectReport", "projectname"
        FROM public.projects;
        `;
        const result = await pool.query(query);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Project not found" });
        }
        const reportPath = result.rows[0].projectReport;

        res.status(200).json({
            message: 'Project report fetched successfully',
            projectName: result.rows,
            reportLink: reportPath
        });
    } catch (error) {
        console.error('Database Error:',error.message);
        res.status(500).json({ error: 'Server Error'});
    }
};

// Get project report by projectId
const getProjectReport = async (req, res) => {
    const { projectId } = req.params;
  
    try {
      const query = `
        SELECT "projectReport"
        FROM public.projects
        WHERE "projectId" = $1;
      `;
  
      const result = await pool.query(query, [projectId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }
  
      const reportPath = result.rows[0].projectReport;
  
      if (!reportPath) {
        return res.status(404).json({ error: "Report not uploaded yet" });
      }
  
      res.status(200).json({
        message: "Project report fetched successfully",
        reportLink: reportPath,
      });
    } catch (error) {
      console.error("Database Error:", error.message);
      res.status(500).json({ error: "Server Error" });
    }
  };

  //get last month project reports
const getLastMonthProjectReport = async (req, res) => {
  try {
      const query = `
      SELECT "projectReport", "projectname"
      FROM public.projects
      WHERE(
        (EXTRACT(DAY FROM CURRENT_DATE) <= 15
        AND "date" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        AND "date" < DATE_TRUNC('month', CURRENT_DATE))

        OR

        (EXTRACT(DAY FROM CURRENT_DATE) > 15
        AND "date" >= DATE_TRUNC('month', CURRENT_DATE)
        AND "date" < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month'))
        );
      `;
      const result = await pool.query(query);
      if (result.rows.length === 0) {
          return res.status(404).json({ error: "Project not found" });
      }

      res.status(200).json({
          result: result.rows,

      });
  } catch (error) {
      console.error('Database Error:',error.message);
      res.status(500).json({ error: 'Server Error'});
  }
};

  //uplord or update project proposels

  const uploadProjectProposels = async (req, res) => {
    const { projectId } = req.params;
    const { projectProposal } = req.body;
  
    try {
      if (!projectProposal) {
        return res.status(400).json({ error: "No project proposal provided" });
      }

      const checkQuery = `SELECT * FROM public.projects WHERE "projectId" = $1`;
      const checkResult = await pool.query(checkQuery, [projectId]);
  
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }
  
      const updateQuery = `
        UPDATE public.projects
        SET "projectProposal" = $1
        WHERE "projectId" = $2
        RETURNING *;
      `;
      const values = [projectProposal, projectId];
  
      const result = await pool.query(updateQuery, values);
  
      res.status(200).json({
        message: 'Project proposal uploaded successfully',
        project: result.rows[0],
      });
    } catch (error) {
      console.error('Database Error:', error.message);
      res.status(500).json({ error: 'Server Error: ' + error.message });
    }
  };
  
  const getProjectProposal = async (req, res) => {
    const { projectId } = req.params;
  
    try {
      const query = `
        SELECT "projectProposal"
        FROM public.projects
        WHERE "projectId" = $1;
      `;
      const values = [projectId];
  
      const result = await pool.query(query, values);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }
  
      const projectProposalLink = result.rows[0].projectProposal;
  
      res.status(200).json({
        message: 'Project proposal retrieved successfully',
        projectProposal: projectProposalLink,
      });
    } catch (error) {
      console.error('Database Error:', error.message);
      res.status(500).json({ error: 'Server Error' });
    }
  }
  


module.exports = {
    uploadProjectReport,
    getAllProjectReport,
    getProjectReport,
    uploadProjectProposels,
    getProjectProposal,
    getLastMonthProjectReport
}
