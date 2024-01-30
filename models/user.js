import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  salt: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },

  wishlist: [
    {
      type: Object,
      // ref: "MovieWishlist",
      required: true,
    },
  ],
  tvwishlist: [
    {
      type: Object,
      // ref: "MovieWishlist",
      required: true,
    },
  ],
});

const User = mongoose.model("User", userSchema);

export default User;
