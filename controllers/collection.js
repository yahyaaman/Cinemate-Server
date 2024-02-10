import mongoose from "mongoose";
import Collection from "../models/collection.js";
import User from "../models/user.js";

export const getCollectionByID = async (req, res) => {
  const CollectionID = req.params.id;

  try {
    const existingCollection = await Collection.findById(CollectionID);

    if (!existingCollection) {
      return res.status(404).json({
        message: "Collection not found",
      });
    }

    return res.status(200).json({ existingCollection });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const getAllCollections = async (req, res, next) => {
  let collections;
  try {
    collections = await Collection.find();
  } catch (err) {
    console.log(err);
  }
  if (!collections) {
    return res.status(404).json({
      message: "No User found",
    });
  }

  return res.status(200).json({ collections });
};

export const createCollection = async (req, res) => {
  try {
    const { name, user } = req.body;

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

    let existingCollection;
    try {
      existingCollection = await Collection.findOne({ name });
    } catch (err) {
      return console.log(err);
    }
    if (existingCollection) {
      return res.status(400).json({
        message: "Collection Already Exists",
      });
    }

    const newCollection = new Collection({
      name,
      user,
    });
    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      await newCollection.save();

      existingUser.collections.push(newCollection);
      await existingUser.save();

      return res.status(201).json(newCollection);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error });
    }
  } catch (error) {
    console.error("Error creating collection:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteCollection = async (req, res) => {};

export const editCollection = async (req, res) => {
  try {
    const { name, user } = req.body;
    const CollectionID = req.params.id;
    const existingCollection = await Collection.findById(CollectionID);

    if (!existingCollection) {
      return res.status(404).json({
        message: "Collection not found",
      });
    }

    let existingUser;
    try {
      existingUser = await User.findById(req.body.user);
    } catch (error) {
      console.error("Error finding user:", error);
      return res.status(500).json({ message: "Server Error" });
    }

    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "Unable to find user with this ID" });
    }

    let existing_Collection;
    try {
      existing_Collection = await Collection.findOne({ name });
    } catch (err) {
      return console.log(err);
    }
    if (existing_Collection) {
      return res.status(400).json({
        message: "Collection With This Name Already Exists",
      });
    }

    const updatedCollection = await Collection.findByIdAndUpdate(CollectionID, {
      name,
      user,
    });
    if (updatedCollection) {
      return res.status(201).json({ updatedCollection });
    }
  } catch (error) {
    console.error("Error updating collection:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const addItemToCollection = async (req, res) => {
  try {
    const { name, itemID, itemImg, itemDate, itemType, collectionID, user } =
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

    const existingCollection = await Collection.findById(collectionID);

    if (!existingCollection) {
      return res.status(404).json({
        message: "Collection not found",
      });
    }

    const existingItem = existingCollection.items.find(
      (item) => item.itemID === itemID && item.itemType === itemType
    );

    if (existingItem) {
      return res.status(400).json({
        message: "Item already exists in the collection",
      });
    }

    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      existingCollection.items.push({
        name,
        itemID,
        itemImg,
        itemDate,
        itemType,
      });
      await existingCollection.save();
      await session.commitTransaction();
      return res.status(201).json(existingCollection);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error });
    }
  } catch (error) {
    console.error("Error adding to collection:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
