import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const protectRoute = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res
          .status(401)
          .json({
            success: false,
            message: "Not authorized, token not found",
          });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded?.id).select("-password");
      if (!req.user) {
        return res.status(404).json({
          success: false,
          message: "Not authorized, token expired or user deleted",
        });
      }
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, token failed" });
    }
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized, No token provided" });
  }
};

export default protectRoute;
