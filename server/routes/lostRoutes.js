import express from 'express';
import { addLostItem,getLostItemById,getLostItems } from "../controllers/lostController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from '../utils/upload.js';

const router=express.Router();

router.route('/').get(getLostItems).post(protect,upload.single("image"),addLostItem);
router.route("/:id").get(getLostItemById).put(protect, upload.single("image"), updateLostItem).delete(protect, deleteLostItem);

export default router;