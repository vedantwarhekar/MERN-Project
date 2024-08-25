import mongoose, { Schema } from "mongoose";

const subscryptionSchema = new Schema({
  subscryber: {
    type: Schema.Types.ObjectId, // one whoe is subscrybing
    ref: "User",
  },
  channel: {
    type: Schema.Types.ObjectId, // one to whom 'subscriber' is 'subscrybing
    ref: "User",
  },
});

export const Subscryption = new mongoose.model(
  "Subscryption",
  subscryptionSchema
);
