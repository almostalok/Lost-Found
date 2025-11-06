// routes/foundRoutes.js
import express from "express";
import { addFoundItem, getFoundItems, getFoundItemsById, updateFoundItem, deleteFoundItem, claimFoundItem, getFoundItemClaims, updateFoundItemClaim } from "../controllers/foundController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../utils/upload.js";

const router = express.Router();

router.route("/").get(getFoundItems).post(protect,upload.single("image"), addFoundItem);
router.route("/:id").get(getFoundItemsById).put(protect, upload.single('image'), updateFoundItem).delete(protect, deleteFoundItem);
router.route("/:id/claim").post(protect, claimFoundItem);
router.route("/:id/claims").get(protect, getFoundItemClaims);
router.route("/:id/claims/:claimId").put(protect, updateFoundItemClaim);

export default router;
