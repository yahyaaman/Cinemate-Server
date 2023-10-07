import User from "../models/user.js";
import bcrypt from "bcrypt";
import { sendTokenToClient } from "../utils/features.js";

export const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find();
  } catch (err) {
    console.log(err);
  }
  if (!users) {
    return res.status(404).json({
      message: "No User found",
    });
  }

  return res.status(200).json({ users });
};

export const signup = async (req, res, next) => {
  const { name, email, password, address, phone } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return console.log(err);
  }
  if (existingUser) {
    return res.status(400).json({
      message: "User Already Exists",
    });
  }

  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);

  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    salt,
    address,
    phone,
  });

  try {
    await newUser.save();
  } catch (err) {
    return console.log(err);
  }
  return res.status(201).json({ newUser });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  let existingUserID;
  try {
    existingUser = await User.findOne({ email });
    existingUserID = await existingUser.id;
  } catch (err) {
    return console.log(err);
  }
  if (!existingUser) {
    return res.status(404).json({
      message: "User does not exist",
    });
  }
  const isPasswordCorrect = await bcrypt.compare(
    password,
    existingUser.password
  );
  if (!isPasswordCorrect) {
    return res.status(400).json({
      message: "Incorrect Password",
    });
  }

  try {
    const result = sendTokenToClient(existingUser, "Login Successful");
    return res.status(200).json({ result, existingUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error while sending token",
    });
  }
};

export const deleteUser = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return console.log(err);
  }
  if (!existingUser) {
    return res.status(404).json({
      message: "User does not exist",
    });
  }
  const isPasswordCorrect = await bcrypt.compare(
    password,
    existingUser.password
  );
  if (!isPasswordCorrect) {
    return res.status(400).json({
      message: "Incorrect Password",
    });
  }

  try {
    await User.findOneAndDelete({ email });
    res.status(200).send({
      success: true,
      message: "User Deleted successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error while deleting user",
      err,
    });
  }
};

export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const isCurrentPasswordCorrect = await bcrypt.compare(
    currentPassword,
    req.user.password
  );

  if (!isCurrentPasswordCorrect) {
    return res.status(400).json({
      message: "Current password is incorrect",
    });
  }

  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  try {
    await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });
  } catch (err) {
    console.log(err);
  }

  return res.status(202).json({
    message: "Password changed successfully",
  });
};
