import FoundItem from "../models/foundItemModel.js";
import {matchItems} from '../utils/matchAlgorithm.js'

export const addFoundItem=async (req,res) => {

    // Require Aadhar verification before allowing posting
    if (!req.user || req.user.aadharStatus !== 'verified') {
      res.status(403);
      throw new Error('Aadhar verification required to post found items');
    }

    const{title,description,category,location,dateFound}=req.body;
    const image = req.file ? req.file.path : "";

  // create the found item using the FoundItem model
  const foundItem = await FoundItem.create({
    title,
    description,
    category,
    image,
    location,
    dateFound,
    user: req.user._id,
  });

  const lostMatches = await matchItems(null, foundItem);
  res.status(201).json({ found: foundItem, matches: lostMatches });

    
};

export const getFoundItems=async (req,res) => {
    const items = await FoundItem.find().populate("user","name email");
    res.json(items);

}

export const getFoundItemsById=async (req,res) => {

    const item = await FoundItem.findById(req.params.id).populate("user", "name email");
  if (!item) {
    res.status(404);
    throw new Error("Found item not found");
  }
  res.json(item);
    
}

export const updateFoundItem = async (req, res) => {
  const item = await FoundItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Found item not found');
  }

  // Only owner can update
  if (!req.user || item.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this item');
  }

  const { title, description, category, location, dateFound } = req.body;
  if (title !== undefined) item.title = title;
  if (description !== undefined) item.description = description;
  if (category !== undefined) item.category = category;
  if (location !== undefined) item.location = location;
  if (dateFound !== undefined) item.dateFound = dateFound;
  if (req.file && req.file.path) item.image = req.file.path;

  await item.save();

  const matches = await matchItems(null, item);
  res.json({ item, matches });
};

export const deleteFoundItem = async (req, res) => {
  const item = await FoundItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Found item not found');
  }

  if (!req.user || item.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this item');
  }

  await item.remove();
  res.json({ message: 'Found item removed' });
};

// Claim a found item (user thinks it's theirs)
export const claimFoundItem = async (req, res) => {
  const item = await FoundItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Found item not found');
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

// Get claims for a found item (owner only)
export const getFoundItemClaims = async (req, res) => {
  const item = await FoundItem.findById(req.params.id)
    .populate('claims.claimant', 'name email');
  
  if (!item) {
    res.status(404);
    throw new Error('Found item not found');
  }

  // Only owner can view claims
  if (!req.user || item.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view claims');
  }

  res.json(item.claims);
};

// Update claim status (approve/deny) - owner only
export const updateFoundItemClaim = async (req, res) => {
  const item = await FoundItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Found item not found');
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