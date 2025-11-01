import FoundItem from "../models/foundItemModel.js";
import {matchItems} from '../utils/matchAlgorithm.js'

export const addFoundItem=async (req,res) => {

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
    user: req.user?._id,
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