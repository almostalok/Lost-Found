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

export const updateLostItem = async (req, res) => {
  const item = await LostItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Lost item not found');
  }

  // Only owner can update
  if (!req.user || item.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this item');
  }

  const { title, description, category, location, dateLost } = req.body;
  if (title !== undefined) item.title = title;
  if (description !== undefined) item.description = description;
  if (category !== undefined) item.category = category;
  if (location !== undefined) item.location = location;
  if (dateLost !== undefined) item.dateLost = dateLost;
  if (req.file && req.file.path) item.image = req.file.path;

  await item.save();

  // run matching again if desired
  const matches = await matchItems(item);
  res.json({ item, matches });
};

export const deleteLostItem = async (req, res) => {
  const item = await LostItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Lost item not found');
  }

  if (!req.user || item.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this item');
  }

  await item.remove();
  res.json({ message: 'Lost item removed' });
};
