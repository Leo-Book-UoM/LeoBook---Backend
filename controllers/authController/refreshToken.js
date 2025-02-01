const jwt = require('jsonwebtoken');
const pool = require('../../config/dbConfig');
const { generateAccessToken } = require('./authController');
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;

// const refreshAccessToken = async (req , res) => {
//     const { refreshToken } = req.body;
//     if(refreshToken == null){
//         return res.status(401);
//     }

//     if( !refreshToken) {
//         return res.status(403).json({ message: 'Refresh token required' });
//     }

//     try{
//         const decoded = jwt.verify(refreshToken, jwtSecret);
//         const accessToken = generateAccessToken(decoded.userId, decoded.email);
//         res.status(200).json({ accessToken });
//     }catch(err) {
//         console.error(err.message);
//         res.status(403).json({ message: 'Invalid or expired refresh token'});
//     }
// };

//Token refresh endpoint
const refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
        return res.status(401).json({ message: 'No refresh token provided'});
    }

    try{
        const decoded = jwt.verify(refreshToken, jwtSecret);
        const user = await pool.query('SELECT * FROM public.users WHERE "userId" = $1', [decoded.userId]);

        if(user.rows.length === 0){
            return res.status(401).json({ message: 'Invalid refresh token'});
        }
        const role = await pool.query('SELECT "roleName" FROM public.roles WHERE "roleId" = $1', [user.rows[0].roleId]);
        const roleName = role.rows[0].roleName;

        const newAccessToken = generateAccessToken(user.rows[0].userId, user.rows[0].email, user.rows[0].userName, user.rows[0].roleId, roleName);

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60* 60*24* 1000, 
        });

        res.status(200).json({ message: 'Access token refreshed' });
    }catch (err) {
        console.error(err.message);
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};

module.exports={
    refreshToken
};