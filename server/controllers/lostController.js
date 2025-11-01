// controllers/lostController.js
import LostItem from "../models/lostItemModel.js"
import { matchItems } from "../utils/matchAlgorithm.js";

export const addLostItem = async (req, res) => {
  const { title, description, category,  location, dateLost } = req.body;
  const image = req.file ? req.file.path : "";
  const lost = await LostItem.create({
    title, description, category, image, location, dateLost, user: req.user._id
  });
  // simple immediate matching (optional)
  const foundMatches = await matchItems(lost);
  res.status(201).json({ lost, matches: foundMatches });
};

export const getLostItems = async (req, res) => {
  const items = await LostItem.find().populate("user", "name email");
  res.json(items);
};

export const getLostItemById = async (req, res) => {
  const item = await LostItem.findById(req.params.id).populate("user", "name email");
  if (!item) {
    res.status(404);
    throw new Error("Lost item not found");
  }
  res.json(item);
};
