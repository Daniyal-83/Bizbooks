const express = require("express");
const { body } = require("express-validator");
const { registerUser, loginUser, logoutUser } = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  ],
  registerUser
);
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  loginUser
);
router.post("/logout", logoutUser);

module.exports = router;
