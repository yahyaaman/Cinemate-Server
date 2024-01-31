import express from "express";
import {
  getAllUsers,
  signup,
  login,
  changePassword,
  deleteUser,
  addToWishlist,
  removeFromWishlist,
  addToTvWishlist,
  removeFromTvWishlist,
  getAUser,
  generateResetToken,
  forgotPassword,
} from "../controllers/user.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/get-user/:id", getAUser);

router.post("/signup", signup);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/generate-token", generateResetToken);

router.post("/addToWishlist", addToWishlist);
router.post("/removeFromWishlist", removeFromWishlist);
router.post("/addToTvWishlist", addToTvWishlist);
router.post("/removeFromTvWishlist", removeFromTvWishlist);

router.post("/change-password", isAuthenticated, changePassword);
router.delete("/delete-user", isAuthenticated, deleteUser);

export default router;
