import User from "../models/userModel.js";
import { deepCompareArrays } from "../utils/commonMethods.js";

// @desc    Create a new note
// @route   POST /api/note/create
// @access  Private
export const createNote = async (req, res) => {
  try {
    const { id, title, content, color, status, pinned } = req.body;

    if (!title.trim() && !title.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Title and content cannot be empty" });
    }

    const newNote = {
      id:
        id ||
        "note-" +
          Math.random().toString(36).substring(2) +
          "-" +
          Math.random().toString(36).substring(2) +
          "-" +
          Math.random().toString(36).substring(2),
      status: status || "active", // active, archived
      title: title.trim(),
      content: content.trim(),
      color: color || "#171717",
      pinned: pinned ?? false,
      updatedAt: new Date(),
    };

    const user = await User.findById(req.user._id);
    if (user) {
      user.notes.push(newNote);
      await user.save();
      return res.status(201).json({
        success: true,
        message: "Note created successfully",
        newNote,
        notes: user.notes,
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to create note; " + error.message,
    });
  }
};

// @desc    Update a note
// @route   PUT /api/note/update
// @access  Private
export const updateNote = async (req, res) => {
  try {
    const { id, title, content, color, pinned, status } = req.body;

    // if note id not provided, return error
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Note id not provided" });
    }
    // if title & content are empty, delete note
    if (!title.trim() && !content.trim()) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.notes = user.notes.filter((note) => note.id !== id);
        await user.save();
        return res.status(200).json({
          success: true,
          message: "Note deleted successfully",
          notes: user.notes,
        });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
    }
    // if everything is correctly passed, update note
    const user = await User.findById(req.user._id);
    if (user) {
      user.notes = user.notes.map((note) =>
        note.id === id
          ? {
              ...note,
              title: title.trim(),
              content: content.trim(),
              color: color || "#171717",
              pinned: pinned ?? false,
              status: status || "active",
              updatedAt: new Date(),
            }
          : note
      );
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Note updated successfully",
        updatedNote: user.notes.find((note) => note.id === id),
        notes: user.notes,
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update note; " + error.message,
    });
  }
};

// @desc    Delete a note
// @route   DELETE /api/note/delete
// @access  Private
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Note id not provided" });
    }

    const user = await User.findById(req.user._id);
    if (user) {
      const targetNote = user.notes.find((note) => note.id === id);
      if (!targetNote) {
        return res
          .status(404)
          .json({ success: false, message: "Note not found / deleted" });
      }
      user.notes = user.notes.filter((note) => note.id !== id);
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Note deleted successfully",
        notes: user.notes,
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete note; " + error.message,
    });
  }
};

// @desc    push all created notes from local storage to database
// @route   POST /api/note/push
// @access  Private
export const pushNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const user = await User.findById(req.user._id);
    if (user) {
      if (deepCompareArrays(user.notes, notes)) {
        return res.status(200).json({
          success: true,
          message: "Notes are already up to date",
          notes: user.notes,
        });
      }
      user.notes = notes;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Notes pushed successfully",
        notes: user.notes,
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to push notes; " + error.message,
    });
  }
};
