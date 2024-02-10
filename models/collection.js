import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  items: [
    {
      type: Object,
      required: true,
    },
  ],
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: false,
  },
});

const Collection = mongoose.model("Collection", collectionSchema);

export default Collection;
