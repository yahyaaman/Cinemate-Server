import express from "express";
import {
  createCollection,
  getCollectionByID,
  editCollection,
  getAllCollections,
  addItemToCollection,
} from "../controllers/collection.js";

const router = express.Router();

router.post("/create-collection", createCollection);
router.get("/", getAllCollections);
router.get("/get-collection/:id", getCollectionByID);
router.put("/edit-collection/:id", editCollection);
router.post("/add-to-collection", addItemToCollection);

// router.post("/signup", signup);

// router.delete("/delete-user", isAuthenticated, deleteUser);

export default router;
