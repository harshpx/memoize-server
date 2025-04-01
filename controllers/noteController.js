import User from "../models/userModel.js";
import { deepEqual, syncArray } from "../utils/commonMethods.js";

// @desc    Create a new note
// @route   POST /api/note/create
// @access  Private
export const createNote = async (req, res) => {
  try {
    const { id, title, content, color, status, pinned } = req.body;

    if (!title.trim() && !content.trim()) {
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
      deleted: false,
      updatedAt: new Date(),
    };

    req.user.notes.push(newNote);
    await req.user.save();
    return res.status(201).json({
      success: true,
      message: "Note created successfully",
      newNote,
      notes: req.user.notes,
    });
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
      req.user.notes = req.user.notes.filter((note) => note.id !== id);
      await req.user.save();
      return res.status(200).json({
        success: true,
        message: "Note deleted successfully",
        notes: req.user.notes,
      });
    }
    // if everything is correctly passed, update note
    req.user.notes = req.user.notes.map((note) =>
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
    await req.user.save();
    return res.status(200).json({
      success: true,
      message: "Note updated successfully",
      updatedNote: req.user.notes.find((note) => note.id === id),
      notes: req.user.notes,
    });
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

    const targetNote = req.user.notes.find((note) => note.id === id);
    if (!targetNote) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found / deleted" });
    }
    req.user.notes = req.user.notes.map((note) =>
      note.id === id ? { ...note, deleted: true, updatedAt: new Date() } : note
    );
    await req.user.save();
    return res.status(200).json({
      success: true,
      message: "Note deleted successfully",
      notes: req.user.notes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete note; " + error.message,
    });
  }
};

// @desc    push all created notes from local storage to database
// @route   PUT /api/note/sync
// @access  Private
export const syncNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const syncedNotes = syncArray(notes, req.user.notes);
    if (
      syncedNotes.length === req.user.notes.length &&
      JSON.stringify(syncedNotes) === JSON.stringify(req.user.notes)
    ) {
      return res.status(200).json({
        success: true,
        message: "Notes are already synced",
        notes: req.user.notes,
      });
    }
    req.user.notes = syncedNotes;
    await req.user.save();
    return res.status(200).json({
      success: true,
      message: "Notes synced successfully",
      notes: req.user.notes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to sync notes; " + error.message,
    });
  }
};
