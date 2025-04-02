import express from "express";
import {
  checkEmailAvailability,
  checkResetPasswordToken,
  checkUsernameAvailability,
  deleteUser,
  getUser,
  loginUser,
  registerUser,
  sendResetPasswordEmail,
  syncUserData,
  updateAvatar,
} from "../controllers/userController.js";
import protectRoute from "../middlewares/authHandler.js";

const userRoutes = express.Router();

userRoutes.route("/register").post(registerUser);
userRoutes.route("/login").post(loginUser);
userRoutes
  .route("/check-username-availability")
  .post(checkUsernameAvailability);
userRoutes.route("/check-email-availability").post(checkEmailAvailability);
userRoutes.route("/fetch-user").get(protectRoute, getUser);
userRoutes.route("/update-avatar").put(protectRoute, updateAvatar);
userRoutes.route("/delete-user").delete(protectRoute, deleteUser);
userRoutes.route("/sync").put(protectRoute, syncUserData);
userRoutes.route("/send-reset-password").post(sendResetPasswordEmail);
userRoutes.route("/check-reset-password").put(checkResetPasswordToken);

export default userRoutes;
