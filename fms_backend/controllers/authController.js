// controllers/authController.js
const { validationResult } = require("express-validator");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Register user
const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    const { name, email, password } = req.body;

    // check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      generateToken(res, user._id);
      res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // compare password using model method
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // generate token and set cookie
    const token = generateToken(res, user._id);

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      token, // optional, since cookie is set
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout user
const logoutUser = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ message: "Logged out successfully" });
};

module.exports = { registerUser, loginUser, logoutUser };
