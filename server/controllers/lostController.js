// controllers/lostController.js
import LostItem from "../models/lostItemModel.js"
import { matchItems } from "../utils/matchAlgorithm.js";

export const addLostItem = async (req, res) => {
  // Require Aadhar verification before allowing posting
  if (!req.user || req.user.aadharStatus !== 'verified') {
    res.status(403);
    throw new Error('Aadhar verification required to post lost items');
  }

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

// Claim a lost item (user found it and wants to return)
export const claimLostItem = async (req, res) => {
  const item = await LostItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Lost item not found');
  }

  // Can't claim your own item
  if (req.user && item.user.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot claim your own item');
  }

  // Check if user already claimed this item
  const existingClaim = item.claims.find(
    c => c.claimant.toString() === req.user._id.toString()
  );
  if (existingClaim) {
    res.status(400);
    throw new Error('You have already claimed this item');
  }

  const { message } = req.body;
  item.claims.push({
    claimant: req.user._id,
    message: message || '',
    status: 'pending',
  });

  await item.save();
  res.status(201).json({ message: 'Claim submitted', item });
};

// Get claims for a lost item (owner only)
export const getLostItemClaims = async (req, res) => {
  const item = await LostItem.findById(req.params.id)
    .populate('claims.claimant', 'name email');
  
  if (!item) {
    res.status(404);
    throw new Error('Lost item not found');
  }

  // Only owner can view claims
  if (!req.user || item.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view claims');
  }

  res.json(item.claims);
};

// Update claim status (approve/deny) - owner only
export const updateLostItemClaim = async (req, res) => {
  const item = await LostItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Lost item not found');
  }

  // Only owner can update claims
  if (!req.user || item.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update claims');
  }

  const claim = item.claims.id(req.params.claimId);
  if (!claim) {
    res.status(404);
    throw new Error('Claim not found');
  }

  const { status } = req.body;
  if (!['approved', 'denied'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status. Use approved or denied');
  }

  claim.status = status;
  await item.save();

  res.json({ message: `Claim ${status}`, claim });
};
