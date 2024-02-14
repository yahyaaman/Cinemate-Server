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

    // let existingCollection;
    // try {
    //   existingCollection = await Collection.findOne({ name });
    // } catch (err) {
    //   return console.log(err);
    // }
    // console.log("Collection ka user", existingCollection.user);
    // console.log("current user", user);
    // if (existingCollection && existingCollection.user === user) {
    //   return res.status(400).json({
    //     message: "Collection Already Exists",
    //   });
    // }

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

export const deleteCollection = async (req, res) => {
  try {
    const collectionID = req.params.id;
    console.log(req);
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

    let existingCollection;
    try {
      existingCollection = await Collection.findByIdAndRemove(
        collectionID
      ).populate("user");
      await existingCollection.user.collections.pull(existingCollection);
      await existingCollection.user.save();

      if (existingCollection) {
        return res
          .status(200)
          .json({ message: "Collection Deleted Successfully" });
      } else {
        res.status(404).json({
          message: "Collection not found",
        });
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
      return res.status(500).json({ message: "Server Error" });
    }
  } catch (error) {
    console.error("Error deleting collection:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

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

export const removeItemFromCollection = async (req, res) => {
  try {
    const { itemID, itemType, collectionID, user } = req.body;

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

    // Find the collection by ID
    const existingCollection = await Collection.findById(collectionID);

    // If the collection doesn't exist, return an error
    if (!existingCollection) {
      return res.status(404).json({
        message: "Collection not found",
      });
    }

    // Find the index of the item with the given itemID and itemType in the collection
    const itemIndex = existingCollection.items.findIndex(
      (item) => item.itemID === itemID && item.itemType === itemType
    );

    // If the item doesn't exist in the collection, return an error
    if (itemIndex === -1) {
      return res.status(404).json({
        message: "Item not found in the collection",
      });
    }

    // Remove the item from the collection's items array
    existingCollection.items.splice(itemIndex, 1);

    // Save the updated collection
    await existingCollection.save();

    // Return success response
    return res.status(200).json({
      message: "Item removed from collection successfully",
    });
  } catch (error) {
    console.error("Error removing item from collection:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getUserCollections = async (req, res, next) => {
  const userID = req.params.id;
  let userCollections;
  try {
    userCollections = await Collection.find({ user: userID });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
  if (!userCollections) {
    return res.status(404).json({ message: "No collections found" });
  }
  return res.status(200).json({ collections: userCollections });
};
