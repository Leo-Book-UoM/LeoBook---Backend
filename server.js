const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const projectsRoutes = require('./routes/projectRoutes/projectRoutes');
require('dotenv').config();
const path = require('path'); 

const app = express();

app.use(cookieParser());

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Routes
app.use(projectsRoutes);

const PORT = process.env.PORT || 443;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
