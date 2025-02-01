const pool = require('../../config/dbConfig');
const bcrypt = require('bcryptjs');
const { json } = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;

// Register a new user
const registerUser = async (req, res) => {
    const { name, mobile, email, password } = req.body;

    try {
        // Check if user already exists
        const userCheck = await pool.query('SELECT * FROM public.users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const result = await pool.query(
            'INSERT INTO public.users ("userName", "mobile", "email", "password") VALUES ($1, $2, $3, $4) RETURNING "userId", "userName", "email"',
            [name, mobile, email, hashPassword]
        );

        // Return the user data (excluding password)
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                userId: result.rows[0].userId,
                name: result.rows[0].userName,
                email: result.rows[0].email
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// Generate access token with userName included
const generateAccessToken = (userId, email, userName, roleId, roleName) => {
    return jwt.sign({ userId, email, userName , roleId, roleName}, jwtSecret, { expiresIn: '15m' });
};

// Generate refresh token
const generateRefreshToken = (userId, email) => {
    return jwt.sign({ userId, email }, jwtSecret, { expiresIn: '7d' });
};

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query('SELECT * FROM public.users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const role = await pool.query('SELECT "roleName" FROM public.roles WHERE "roleId" = $1',[user.rows[0].roleId]);
        const roleName = role.rows[0].roleName;

        // Token generation with userName
        const accessToken = generateAccessToken(user.rows[0].userId, user.rows[0].email, user.rows[0].userName, user.rows[0].roleId, roleName);
        const refreshToken = generateRefreshToken(user.rows[0].userId, user.rows[0].email);

        console.log('Generated Tokens:', { accessToken, refreshToken });//debuging

        //set HTTP-only cookies
        res.cookie('accesToken', accessToken, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60*60 * 1000,
        });

        res.cookie('refreshToken', refreshToken, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60*60*24 * 1000,
        });

        res.status(200).json({ accessToken, refreshToken, roleName });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Fetch all users (protected route)
const getAllUsers = async (req, res) => {
    try {
        if (req.user.roleName !== "President") {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to access this resource.' });
        }

        const result = await pool.query('SELECT "userName", "mobile", "email" FROM public.users ORDER BY "userId"');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    generateAccessToken,
    generateRefreshToken
};
