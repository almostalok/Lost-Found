import Chat from '../models/chatModel.js';
import LostItem from '../models/lostItemModel.js';
import FoundItem from '../models/foundItemModel.js';

// Helper to fetch item and owner
const getItemAndOwner = async (itemType, itemId) => {
  if (itemType === 'lost') {
    const item = await LostItem.findById(itemId).populate('user', '_id name email');
    return { item, owner: item?.user };
  }
  const item = await FoundItem.findById(itemId).populate('user', '_id name email');
  return { item, owner: item?.user };
};

// Get chat for an item (owner or claimant can access)
export const getChatForItem = async (req, res) => {
  const { itemType, itemId } = req.params;
  const { item, owner } = await getItemAndOwner(itemType, itemId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  // Only allow owner or a claimant to view the chat
  const isOwner = req.user && owner && req.user._id.toString() === owner._id.toString();
  const isClaimant = item.claims && item.claims.some(c => c.claimant.toString() === req.user._id.toString());
  if (!isOwner && !isClaimant) {
    res.status(403);
    throw new Error('Not authorized to view chat for this item');
  }

  let chat = await Chat.findOne({ itemType, itemId }).populate('messages.sender', 'name email').populate('participants', 'name email');
  if (!chat) {
    // create an empty chat with participants owner + current user
    const participants = [owner._id, req.user._id].filter(Boolean).map(id => id.toString());
    chat = await Chat.create({ itemType, itemId, participants, messages: [] });
    chat = await Chat.findById(chat._id).populate('messages.sender', 'name email').populate('participants', 'name email');
  }

  res.json(chat);
};

// Post a message in chat for an item
export const postMessageForItem = async (req, res) => {
  const { itemType, itemId } = req.params;
  const { text } = req.body;
  if (!text || !text.trim()) {
    res.status(400);
    throw new Error('Message text is required');
  }

  const { item, owner } = await getItemAndOwner(itemType, itemId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  const isOwner = req.user && owner && req.user._id.toString() === owner._id.toString();
  const isClaimant = item.claims && item.claims.some(c => c.claimant.toString() === req.user._id.toString());
  if (!isOwner && !isClaimant) {
    res.status(403);
    throw new Error('Not authorized to send messages for this item');
  }

  let chat = await Chat.findOne({ itemType, itemId });
  if (!chat) {
    const participants = [owner._id, req.user._id].filter(Boolean);
    chat = await Chat.create({ itemType, itemId, participants, messages: [] });
  }

  chat.messages.push({ sender: req.user._id, text });
  await chat.save();

  const updated = await Chat.findById(chat._id).populate('messages.sender', 'name email').populate('participants', 'name email');
  res.status(201).json(updated);
};
