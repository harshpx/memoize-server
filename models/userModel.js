import mongoose from "mongoose";

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
      url: {
        type: String,
        default: "https://i.imgur.com/8GO2mo5.png",
        required: true,
      },
      updatedAt: { type: Date, default: Date.now },
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

UserSchema.pre("save", function (next) {
  if (this.isModified("avatar.url")) {
    this.avatar.updatedAt = new Date();
  }
  next();
});

const User = mongoose.model("User", UserSchema);
export default User;

// note's schema:
// const noteSchema = {
//   id: String,
//   title: String,
//   content: String,
//   pinned: Boolean,
//   color: String,
//   deleted: Boolean,
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
