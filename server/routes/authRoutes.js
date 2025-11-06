import express from "express";
import { authUser, registerUser, logoutUser, getCurrentUser, requestAadharVerification, listPendingAadharRequests, updateAadharStatus } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../utils/upload.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", authUser);
// Returns current user when authenticated via cookie or Authorization header
router.get("/me", protect, getCurrentUser);
// Logout clears the httpOnly cookie
router.post("/logout", logoutUser);

// User requests Aadhar verification (upload file + number)
router.post('/me/aadhar', protect, upload.single('aadhar'), requestAadharVerification);

// Admin routes for reviewing aadhar requests
router.get('/aadhar/requests', protect, requireAdmin, listPendingAadharRequests);
router.put('/aadhar/:id', protect, requireAdmin, updateAadharStatus);

export default router;
