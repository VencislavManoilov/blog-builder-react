const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const router = express.Router();

// Define the storage configuration for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const videoDir = path.join(__dirname, "..", "files", "videos");
        if (!fs.existsSync(videoDir)) {
            fs.mkdirSync(videoDir, { recursive: true });
        }
        cb(null, videoDir);
    },
    filename: (req, file, cb) => {
        // Generate filename with proper extension
        const ext = path.extname(file.originalname);
        const filename = `video-${Date.now()}${ext}`;
        cb(null, filename);
    }
});

// Initialize the Multer middleware
const upload = multer({ storage: storage });

router.get("/", (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ error: "No name provided" });
    }

    const videoPath = path.join(__dirname, "..", "files", "videos", name);

    if (fs.existsSync(videoPath)) {
        return res.sendFile(videoPath);
    } else {
        return res.status(400).json({ error: "Video doesn't exist" });
    }
});

router.post("/", upload.single('video'), (req, res) => {
    try {
        // The uploaded file will be available as req.file
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: "No video uploaded." });
        }

        // Respond with the file information (e.g., filename)
        res.json({
            message: "Video uploaded successfully.",
            video: file.filename
        });
    } catch (err) {
        console.error('Error handling video upload:', err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;