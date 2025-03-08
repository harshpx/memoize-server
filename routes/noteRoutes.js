import express from "express";
import {
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";
import protectRoute from "../middlewares/authHandler.js";

const noteRoutes = express.Router();

noteRoutes.route("/create").post(protectRoute, createNote);
noteRoutes.route("/update").put(protectRoute, updateNote);
noteRoutes.route("/delete").delete(protectRoute, deleteNote);

export default noteRoutes;
