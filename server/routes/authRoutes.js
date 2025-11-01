import express from "express";
import { authUser, registerUser, logoutUser, getCurrentUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", authUser);
// Returns current user when authenticated via cookie or Authorization header
router.get("/me", protect, getCurrentUser);
// Logout clears the httpOnly cookie
router.post("/logout", logoutUser);

export default router;
