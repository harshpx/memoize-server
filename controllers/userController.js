import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { deepEqual, syncArray } from "../utils/commonMethods.js";

const generateToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });
  return token;
};

// @desc    Register a new user
// @route   POST /api/user/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Incomplete credentials" });
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        message: "Another user with this username already exists",
      });
    }

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: "Another user with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        notes: newUser.notes,
        todos: newUser.todos,
        checklists: newUser.checklists,
      },
      token: generateToken(newUser._id),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to register new user; " + error.message,
    });
  }
};

// @desc    Login a user
// @route   POST /api/user/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Incomplete credentials" });
    }

    const existingUser = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (existingUser) {
      const correctPassword = await bcrypt.compare(
        password,
        existingUser.password
      );
      if (correctPassword) {
        return res.status(200).json({
          success: true,
          message: "User logged in successfully",
          user: {
            _id: existingUser._id,
            username: existingUser.username,
            email: existingUser.email,
            avatar: existingUser.avatar,
            notes: existingUser.notes,
            todos: existingUser.todos,
            checklists: existingUser.checklists,
          },
          token: generateToken(existingUser._id),
        });
      } else {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Unable to login; " + error.message });
  }
};

// @desc    Check username availability
// @route   POST /api/user/check-username-availability
// @access  Public
export const checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Username is already taken" });
    } else {
      return res
        .status(200)
        .json({ success: true, message: "Username available" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to check username availability; " + error.message,
    });
  }
};

// @desc    Check email availability
// @route   POST /api/user/check-email-availability
// @access  Public
export const checkEmailAvailability = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email is already taken" });
    } else {
      return res
        .status(200)
        .json({ success: true, message: "Email available" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to check email availability; " + error.message,
    });
  }
};

// @desc    Fetch user
// @route   POST /api/user/fetch-user
// @access  Private
export const getUser = (req, res) => {
  if (req.user) {
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user: req.user,
    });
  } else {
    return res.status(400).json({ success: false, message: "Unauthenticated" });
  }
};

// @desc    Update avatar
// @route   PUT /api/user/update-avatar
// @access  Private
export const updateAvatar = async (req, res) => {
  try {
    // takes avatar string from request body
    const { avatar } = req.body;
    if (req.user.avatar.url === avatar) {
      return res.status(200).json({
        success: true,
        message: "Avatar is already up to date",
        avatar: req.user.avatar,
      });
    }
    req.user.avatar.url = avatar;
    await req.user.save();
    return res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      avatar: req.user.avatar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update avatar; " + error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/user/delete-user
// @access  Private
export const deleteUser = async (req, res) => {
  try {
    if (req.user) {
      await User.findByIdAndDelete(req.user._id);
      return res
        .status(200)
        .json({ success: true, message: "User deleted successfully" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Unauthenticated" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unable to delete user; " + error.message });
  }
};

// @desc    sync user data
// @route   PUT /api/user/sync
// @access  Private
export const syncUserData = async (req, res) => {
  try {
    const { user: incomingUserData } = req.body;
    let flag = false;
    // Sync avatar
    if (req.user.avatar?.url != incomingUserData.avatar?.url) {
      const serverAvatarUpdateTime = new Date(
        req.user.avatar?.updatedAt
      ).getTime();
      const clientAvatarUpdateTime = new Date(
        incomingUserData.avatar?.updatedAt
      ).getTime();
      if (clientAvatarUpdateTime > serverAvatarUpdateTime) {
        req.user.avatar.url = incomingUserData.avatar?.url;
        flag = true;
      }
    }
    // Sync notes
    const syncedNotesArray = syncArray(incomingUserData.notes, req.user.notes);
    if (JSON.stringify(req.user.notes) !== JSON.stringify(syncedNotesArray)) {
      req.user.notes = syncedNotesArray;
      flag = true;
    }
    // Write code for syncing todos and checklists below.
    if (flag) {
      await req.user.save();
      return res.status(200).json({
        success: true,
        message: "User data synced successfully",
        user: req.user,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "User data is already up to date",
        user: req.user,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to sync user data; " + error.message,
    });
  }
};
