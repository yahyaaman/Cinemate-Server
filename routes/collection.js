import express from "express";
import {
  createCollection,
  getCollectionByID,
  editCollection,
  getAllCollections,
  addItemToCollection,
  removeItemFromCollection,
  getUserCollections,
} from "../controllers/collection.js";

const router = express.Router();

router.post("/create-collection", createCollection);
router.get("/", getAllCollections);
router.get("/get-collection/:id", getCollectionByID);
router.get("/get-user-collections/:id", getUserCollections);
router.put("/edit-collection/:id", editCollection);
router.post("/add-to-collection", addItemToCollection);
router.post("/remove-from-collection", removeItemFromCollection);

// router.post("/signup", signup);

// router.delete("/delete-user", isAuthenticated, deleteUser);

export default router;
