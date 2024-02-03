import User from "../models/user.js";
import bcrypt from "bcrypt";
import { sendTokenToClient } from "../utils/features.js";
import mongoose from "mongoose";
import nodemailer from "nodemailer";

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
  const { email, name, password } = req.body;
  console.log("test", req.body);
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
    email,
    name,
    password: hashedPassword,
  });

  try {
    await newUser.save();
  } catch (err) {
    return console.log(err);
  }
  const result = sendTokenToClient(newUser, "Signup Successful");
  return res.status(201).json({ result, newUser });
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

export const addToWishlist = async (req, res) => {
  try {
    const { name, movieID, movieImg, movieDate, wishlistedDate, user } =
      req.body;

    let existingUser;
    try {
      existingUser = await User.findById(user);
    } catch (error) {
      console.error("Error finding user:", error);
      return res.status(500).json({ message: "Server Error" });
    }

    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "Unable to find user with this ID" });
    }

    try {
      const session = await mongoose.startSession();
      session.startTransaction();
      // await newWishlistedItem.save();

      existingUser.wishlist.push({
        name,
        movieID,
        movieImg,
        movieDate,
        wishlistedDate,
        user,
      });
      await existingUser.save();
      await session.commitTransaction();

      return res.status(201).json(existingUser);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error });
    }
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const addToTvWishlist = async (req, res) => {
  try {
    const { name, tvID, tvImg, tvDate, wishlistedDate, user } = req.body;

    let existingUser;
    try {
      existingUser = await User.findById(user);
    } catch (error) {
      console.error("Error finding user:", error);
      return res.status(500).json({ message: "Server Error" });
    }

    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "Unable to find user with this ID" });
    }

    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      existingUser.tvwishlist.push({
        name,
        tvID,
        tvImg,
        tvDate,
        wishlistedDate,
        user,
      });
      await existingUser.save();
      await session.commitTransaction();

      return res.status(201).json(existingUser);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error });
    }
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const removeFromTvWishlist = async (req, res) => {
  try {
    const { tvID, user } = req.body;
    let existingUser;
    try {
      existingUser = await User.findById(user);
    } catch (error) {
      console.error("Error finding user:", error);
      return res.status(500).json({ message: "Server Error" });
    }

    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "Unable to find user with this ID" });
    }

    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      // Find the index of the item in the wishlist array
      const indexToRemove = existingUser.tvwishlist.findIndex(
        (item) => item.tvID === tvID
      );

      // If the item is found, remove it from the wishlist array
      if (indexToRemove !== -1) {
        existingUser.tvwishlist.splice(indexToRemove, 1);
      } else {
        return res.status(404).json({ message: "Item not found in wishlist" });
      }

      await existingUser.save();
      await session.commitTransaction();

      return res.status(200).json(existingUser);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error });
    }
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { movieID, user } = req.body;
    let existingUser;
    try {
      existingUser = await User.findById(user);
    } catch (error) {
      console.error("Error finding user:", error);
      return res.status(500).json({ message: "Server Error" });
    }

    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "Unable to find user with this ID" });
    }

    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      // Find the index of the item in the wishlist array
      const indexToRemove = existingUser.wishlist.findIndex(
        (item) => item.movieID === movieID
      );

      // If the item is found, remove it from the wishlist array
      if (indexToRemove !== -1) {
        existingUser.wishlist.splice(indexToRemove, 1);
      } else {
        return res.status(404).json({ message: "Item not found in wishlist" });
      }

      await existingUser.save();
      await session.commitTransaction();

      return res.status(200).json(existingUser);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error });
    }
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAUser = async (req, res) => {
  const userID = req.params.id;
  try {
    const existingUser = await User.findById(userID);

    if (!existingUser) {
      return res.status(404).json({
        message: "User does not exist",
      });
    }

    return res.status(200).json({ existingUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const generateRandomToken = (length) => {
  const characters = "0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters[randomIndex];
  }
  return token;
};

export const generateResetToken = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log(email);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const resetToken = generateRandomToken(5);

    user.resetToken = resetToken;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "hotmail",
      host: "smtp-mail.outlook.com",
      secure: true,
      port: 587,
      auth: {
        user: "yahyaaman@hotmail.com",
        pass: "johncena3534",
      },
    });

    const mailOptions = {
      from: "yahyaaman@hotmail.com",
      to: email,
      subject: "Password Reset Token",
      text: `Your password reset token is: ${resetToken}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
      } else {
        console.log("Email sent: " + info.response);
        return res
          .status(200)
          .json({ message: "Reset token sent successfully" });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email, resetToken, password } = req.body;

  console.log("Token Provided from body: ", resetToken);
  console.log("Password: ", password);
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    console.log("Stored token of the user: ", user.email);

    if (user.resetToken === resetToken) {
      const newPassword = password;

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);

      user.password = await bcrypt.hash(newPassword, salt);

      user.resetToken = null;

      await user.save();

      // Send an email with the new password
      // const transporter = nodemailer.createTransport({
      //   service: "hotmail",
      //   host: "smtp-mail.outlook.com",
      //   secure: false,
      //   port: 587,
      //   auth: {
      //     user: "yahyaaman@hotmail.com", // Replace with your email
      //     pass: "johncena3534", // Replace with your email password
      //   },
      // });

      // const mailOptions = {
      //   from: "yahyaaman@hotmail.com", // Replace with your email
      //   to: email,
      //   subject: "Your New Password",
      //   text: `Your new password is: ${newPassword}`,
      // };

      // transporter.sendMail(mailOptions, (error, info) => {
      //   if (error) {
      //     console.error(error);
      //     return res.status(500).json({ message: "Internal Server Error" });
      //   } else {
      //     console.log("Email sent: " + info.response);
      //     return res
      //       .status(200)
      //       .json({ message: "New password sent successfully" });
      //   }
      // });
      return res.status(200).json({ message: "Password successfully changed" });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
