import mongoose from 'mongoose';

const blockedSlotSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    slot: { type: String, required: true },
    reason: { type: String },
  },
  { timestamps: true }
);

const BlockedSlot = mongoose.model('BlockedSlot', blockedSlotSchema);
export default BlockedSlot;
