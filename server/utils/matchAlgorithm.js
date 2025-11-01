// utils/matchAlgorithm.js
import LostItem from "../models/lostItemModel.js";
import FoundItem from "../models/foundItemModel.js";

/**
 * Basic matching:
 * - Match by category
 * - Match by exact location (lowercased)
 * - Also search by keywords in title/description (simple includes)
 *
 * Usage:
 * matchItems(lostItem) -> returns found items that match
 * matchItems(null, foundItem) -> returns lost items that match
 */
export const matchItems = async (lost = null, found = null) => {
  if (lost) {
    const candidates = await FoundItem.find({
      category: lost.category,
      location: { $regex: new RegExp(lost.location, "i") }
    });
    // simple keyword check
    return candidates.filter(c => {
      const text = (c.title + " " + c.description).toLowerCase();
      const lostText = (lost.title + " " + lost.description).toLowerCase();
      return lostText.split(" ").some(word => word.length > 3 && text.includes(word));
    });
  } else if (found) {
    const candidates = await LostItem.find({
      category: found.category,
      location: { $regex: new RegExp(found.location, "i") }
    });
    return candidates.filter(c => {
      const text = (c.title + " " + c.description).toLowerCase();
      const foundText = (found.title + " " + found.description).toLowerCase();
      return foundText.split(" ").some(word => word.length > 3 && text.includes(word));
    });
  }
  return [];
};
