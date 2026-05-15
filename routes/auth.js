const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const User = require("../models/User"); //../ means go up one folder

const router = express.Router();

// vaildation schemes
const regiserSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

// regiser a user
router.post("/register", async (request, response) => {
  const { error: validationError } = regiserSchema.validate(request.body);
  if (validationError)
    return response
      .status(400)
      .json({ message: validationError.details[0].message });

  const { username, password } = request.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // salt rounds, how many times pwd scrambled
    const newUser = new User({
      username: username,
      password: hashedPassword,
    });
    await newUser.save();
    response.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    response
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
});

// login
router.post("/login", async (request, response) => {
  const { error: validationError } = loginSchema.validate(request.body);
  if (validationError) {
    return response
      .status(400)
      .json({ message: validationError.details[0].message });
  }
  const { username, password } = request.body;

  try {
    const user = await User.findOne({ username: username });
    if (!user) return response.status(401).json({ message: "user not found" });
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return response.status(401).json({ message: "Invalid password" });

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      },
    );
    user.refreshToken = refreshToken;
    await user.save();

    response.json({
      message: "Login successful!",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    response
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
});

// refresh token
router.post("/refresh", async (request, response) => {
  const { refreshToken } = request.body;

  if (!refreshToken) {
    return response.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return response.status(401).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    response.json({ accessToken: newAccessToken });
  } catch (error) {
    response.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

// logout
router.post("/logout", async (request, response) => {
  try {
    const user = await User.findById(request.userId);

    if (!user) {
      return response.status(404).json({ message: "User not found" });
    }

    user.refreshToken = null;
    await user.save();

    response.json({ message: "Logged out successfully!" });
  } catch (error) {
    response
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
});

//
module.exports = router;
