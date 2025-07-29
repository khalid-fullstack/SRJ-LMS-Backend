const express = require("express");
const multer = require("multer");
const {
  uploadMediaToCloudinary,
  deleteMediaFromCloudinary,
} = require("../../helpers/cloudinary");

const router = express.Router();

// ✅ Use in-memory storage for Vercel compatibility
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ POST: Single file upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const result = await uploadMediaToCloudinary(req.file.buffer); // buffer instead of path

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Error uploading file" });
  }
});

// media.routes.js or wherever your media routes are defined
router.delete("/delete/*", async (req, res) => {
  try {
    const publicId = req.params[0]; // Matches entire path after /delete/
    console.log("Deleting public ID:", publicId);

    const result = await deleteMediaFromCloudinary(publicId);

    if (!result || result.result === "not found") {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    res.status(200).json({ success: true, message: "File deleted", result });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    res.status(500).json({ success: false, message: "Failed to delete media" });
  }
});



// ✅ POST: Bulk upload (max 10 files)
router.post("/bulk-upload", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const uploadPromises = req.files.map((file) =>
      uploadMediaToCloudinary(file.buffer) // buffer instead of path
    );

    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Error in bulk uploading files" });
  }
});

module.exports = router;
