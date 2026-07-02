import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

// @desc    Auth admin & get token
// @route   POST /api/admin/login
export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400);
    throw new Error('Please provide username and password');
  }

  const admin = await Admin.findOne({ username });

  if (admin && (await admin.matchPassword(password))) {
    const token = jwt.sign(
      { adminId: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
    });
  } else {
    res.status(401);
    throw new Error('Invalid username or password');
  }
};
