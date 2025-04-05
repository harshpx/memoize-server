import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { deepEqual, syncArray } from "../utils/commonMethods.js";
import sendEmail from "../utils/sendEmail.js";

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

// @desc send reset password email
// @route POST /api/user/send-reset-password
// @access Public
export const sendResetPasswordEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      const token = jwt.sign(
        { email: userExists.email },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
      );
      const text = `Link to reset password of your Memoize account:\n\nhttps://www.memoize.in/reset-password?uat=${token}\n\nRegards,\nTeam Memoize`;
      const subject = "Reset password of your memoize account";

      const emailResponse = await sendEmail(email, subject, text);
      return res.status(200).json({
        success: true,
        message: "Reset password email sent successfully",
        response: emailResponse,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to send reset password email; " + error.message,
    });
  }
};

// @desc check reset password token
// @route PUT /api/user/check-reset-password-token
// @access Public
export const checkResetPasswordToken = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const { email } = jwt.verify(token, process.env.JWT_SECRET);
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Appropriate data not found in token / Invalid token",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      userExists.password = hashedPassword;
      await userExists.save();
      return res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update password; " + error.message,
    });
  }
};

// @update username
// @route PUT /api/user/update-username
// @access Private
export const updateUsername = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    req.user.username = username;
    await req.user.save();
    return res.status(200).json({
      success: true,
      message: "Username updated successfully",
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update username; " + error.message,
    });
  }
};

// @update email
// @route PUT /api/user/update-email
// @access Private
export const updateEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already taken",
      });
    }

    req.user.email = email;
    await req.user.save();
    return res.status(200).json({
      success: true,
      message: "Email updated successfully",
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update email; " + error.message,
    });
  }
};

// @update password
// @route PUT /api/user/update-password
// @access Private
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old and new passwords are required",
      });
    }

    const existingUser = await User.findById(req.user._id);
    const correctPassword = await bcrypt.compare(
      currentPassword,
      existingUser.password
    );
    if (correctPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      existingUser.password = hashedPassword;
      await existingUser.save();
      return res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update password; " + error.message,
    });
  }
};
