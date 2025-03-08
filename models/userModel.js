import mongoose from "mongoose";
import defaultAvatar from "./defaultAvatar.js";


const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    avatar: {
      type: String,
      default: defaultAvatar,
    },
    notes: {
      type: [Object],
      default: [],
    },
    todos: {
      type: [Object],
      default: [],
    },
    checklists: {
      type: [Object],
      default: [],
    },
  },
  { timestamps: true, minimize: false }
);

const User = mongoose.model("User", UserSchema);
export default User;

// note's schema:
// const noteSchema = {
//   id: String,
//   title: String,
//   content: String,
//   pinned: Boolean,
//   color: String,
//   updatedAt: Date
// }
// const todoSchema = {
//   id: String,
//   title: String,
//   completed: Boolean,
//   updatedAt: Date
// }
// checklist's schema:
// TBD
