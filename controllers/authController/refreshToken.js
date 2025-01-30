const jwt = require('jsonwebtoken');
const pool = require('../../config/dbConfig');
const { generateAccessToken } = require('./authController');
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;

const refreshAccessToken = async (req , res) => {
    const { refreshToken } = req.body;
    if(refreshToken == null){
        return res.status(401);
    }

    if( !refreshToken) {
        return res.status(403).json({ message: 'Refresh token required' });
    }

    try{
        const decoded = jwt.verify(refreshToken, jwtSecret);
        const accessToken = generateAccessToken(decoded.userId, decoded.email);
        res.status(200).json({ accessToken });
    }catch(err) {
        console.error(err.message);
        res.status(403).json({ message: 'Invalid or expired refresh token'});
    }
};

module.exports={
    refreshAccessToken
};