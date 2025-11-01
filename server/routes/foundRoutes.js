// routes/foundRoutes.js
import express from "express";
import { addFoundItem, getFoundItems, getFoundItemsById } from "../controllers/foundController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../utils/upload.js";

const router = express.Router();

router.route("/").get(getFoundItems).post(protect,upload.single("image"), addFoundItem);
router.route("/:id").get(getFoundItemsById);

export default router;
