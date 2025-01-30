const pool = require('../../config/dbConfig');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;

//validateEmail
const validateEmail = (email) => {
    const emailRegx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegx.test(email);
};
//validate password
const validatePassword = (password) => {
    const validatePassword = (password) => {
        const passwordRegx = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegx.text(password);
    }
}

//Register a new user
const registerUser = async(req ,res) => {
    const {name, mobile, email, password } = req.body;

    try{
        const userCheck = await pool.query('SELECT * FROM public.users WHERE email = $1',[email]);
            if(userCheck.rows.length > 0) {
                return res.status(400).json({message: 'User alrady exists' });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
        'INSERT INTO public.users ("userName", "mobile", "email", "password") VALUES ($1, $2, $3, $4) RETURNING "userId", "userName", "email"',
        [name, mobile, email, hashPassword]
    );

    if(result.rows.length > 0){
    res.status(201).json({message: 'User registered successfully',
        user: {
            userId: result.rows[0].userId,
            name: result.rows[0].userName,
            email: result.rows[0].email
        }
     });
    }else {
        return res.status(500).json({ message: 'Failed to register user' });
    }
}catch(err) {
    console.error(err.message);
    res.status(500).json({ error: 'Sever error' });
}
}

//generate access token
const generateAccessToken = (userId, email) => {
    return jwt.sign({ userId, email }, jwtSecret, {expiresIn: '1h'});
};

//generate refresh token
const generateRefreshToken =(userId, email) => {
    return jwt.sign({ userId, email }, jwtSecret, { expiresIn: '7d'});
};

//Login user
const loginUser = async (req , res)=> {
    const { email, password} = req.body;

    try{
        const user = await pool.query('SELECT * FROM public.users WHERE email = $1', [email]);
        if(user.rows.length === 0){
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if(!isMatch){
            return res.status(400).json({ message: 'Invalid password'});
        }

        //Token generation
        const accessToken = generateAccessToken(user.rows[0].userid, user.rows[0].email);
        const refreshToken = generateRefreshToken(user.rows[0].userid, user.rows[0].email);

        res.status(200).json({ accessToken, refreshToken });
    }catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

//Fetch all users(protected route)
const getAllUsers = async (req, res) => {
    try {
      if (req.user.roleId === 1) {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to access this resource.' });
      }
  
      const result = await pool.query('SELECT * FROM public.users ORDER BY "userId"');
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