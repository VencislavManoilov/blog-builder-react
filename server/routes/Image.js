const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Define the storage configuration for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const imageDir = path.join(__dirname, "..", "files", "images");
        if (!fs.existsSync(imageDir)) {
            fs.mkdirSync(imageDir, { recursive: true });
        }
        cb(null, imageDir);
    },
    filename: (req, file, cb) => {
        // Generate filename with proper extension
        const ext = path.extname(file.originalname);
        const filename = `image-${Date.now()}${ext}`;
        cb(null, filename);
    }
});

// Initialize the Multer middleware
const upload = multer({ storage: storage });

router.get("/", (req, res) => {
    const { name } = req.query;

    if(!name) {
        return res.status(400).json({ error: "No name provided" });
    }

    const imagePath = path.join(__dirname, "..", "files", "images", name);

    if(fs.existsSync(imagePath)) {
        return res.sendFile(imagePath)
    } else {
        return res.status(400).json({ error: "Image doesn't exist" });
    }
})

// POST route for image upload
router.post("/", upload.single('image'), (req, res) => {
    try {
        // The file will be available on req.file
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: "No file uploaded." });
        }

        // Respond with the file information
        res.json({
            message: "Image uploaded successfully.",
            image: file.filename
        });
    } catch (err) {
        console.error('Error handling file upload:', err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;