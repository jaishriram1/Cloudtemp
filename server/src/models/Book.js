import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileUrl: { type: String },
  fileName: { type: String },
  isPublic: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Book", bookSchema);
