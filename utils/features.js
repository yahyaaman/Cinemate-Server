import jwt from "jsonwebtoken";
import { config } from "dotenv";

config({
  path: "./config.env",
});

export const sendTokenToClient = (user, message) => {
  try {
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    return {
      success: true,
      message,
      token,
    };
  } catch (err) {
    console.error(err);
    throw new Error("Error while generating token");
  }
};
