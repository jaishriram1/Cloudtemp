import express from "express";
import mongoose from "mongoose";
import { authenticate } from "../middleware/auth.js";
import { upload } from "../middleware/multer.js";
import Book from "../models/Book.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const router = express.Router();

// PUBLIC BOOKS
router.get("/public", async (req, res) => {
  try {
    const books = await Book.find({ isPublic: true })
      .populate("userId", "name email")
      .exec();

    res.json(books);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch public books" });
  }
});

// USER'S BOOKS
router.get("/my-books", authenticate, async (req, res) => {
  try {
    const books = await Book.find({ userId: req.user._id });
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch your books" });
  }
});

// GET BOOK BY ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid book ID" });
    }

    const book = await Book.findById(id)
      .populate("userId", "name email")
      .exec();

    if (!book) return res.status(404).json({ error: "Book not found" });

    if (!book.isPublic && String(book.userId) !== String(req.user._id)) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(book);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch book" });
  }
});

// CREATE BOOK
router.post(
  "/",
  authenticate,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const { title, author, description, isPublic } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: "Title and author are required" });
    }

    let fileUrl = null;
    let fileName = null;

    if (req.file) {
      const result = await uploadOnCloudinary(req.file.path);
      fileUrl = result.secure_url;
      fileName = req.file.originalname;
    }

    const book = await Book.create({
      title,
      author,
      description,
      isPublic,
      userId: req.user._id, // ✅ FIXED
      fileUrl,
      fileName,
    });

    res.status(201).json(book);
  })
);

// UPDATE BOOK
router.put(
  "/:id",
  authenticate,
  upload.single("file"),
  asyncHandler(async (req, res) => {

    const id = req.params.id; // always available now

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ error: "Book ID is required and must be valid" });
    }

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ error: "Book not found" });

    if (String(book.userId) !== String(req.user._id)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    let fileUrl = book.fileUrl;
    let fileName = book.fileName;

    if (req.file) {
      const result = await uploadOnCloudinary(req.file.path);
      fileUrl = result.secure_url;
      fileName = req.file.originalname;
    }

    const updated = await Book.findByIdAndUpdate(
      id,
      { ...req.body, fileUrl, fileName },
      { new: true }
    );

    res.json(updated);
  })
);

// DELETE BOOK
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid book ID" });
    }

    const book = await Book.findById(id);

    if (!book) return res.status(404).json({ error: "Book not found" });

    if (String(book.userId) !== String(req.user._id)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await Book.findByIdAndDelete(id);

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete book" });
  }
});

export default router;
