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
  origin: 'https://frontend-seven-eta-64.vercel.app', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.options('*', cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://frontend-seven-eta-64.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Routes
app.use(projectsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
