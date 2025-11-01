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