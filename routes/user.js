import express from "express";
import {
  getAllUsers,
  signup,
  login,
  changePassword,
  deleteUser,
} from "../controllers/user.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getAllUsers);
router.post("/signup", signup);
router.post("/login", login);
router.post("/change-password", isAuthenticated, changePassword);
router.delete("/delete-user", isAuthenticated, deleteUser);

export default router;
