const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

router.get("/", (req, res) => {
    const { name } = req.body;

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

router.post("/", (req, res) => {
    let videoData = [];
    let filename = '';

    const contentType = req.headers['content-type'];

    if (contentType) {
        const ext = contentType.split("/")[1]; // Extract 'mp4' from 'video/mp4', etc.
        filename = `video-${Date.now()}.${ext}`;
    } else {
        filename = `file-${Date.now()}.bin`;
    }

    req.on("data", chunk => {
        videoData.push(chunk);
    });

    req.on("end", () => {
        const buffer = Buffer.concat(videoData);
        const savePath = path.join(__dirname, "..", "files", "videos", filename);

        // Ensure the directory exists (synchronously)
        const videosDir = path.join(__dirname, "..", "files", "videos");

        try {
            if (!fs.existsSync(videosDir)) {
                // Synchronously create the directory
                fs.mkdirSync(videosDir, { recursive: true });
            }

            // Write the file
            fs.writeFileSync(savePath, buffer, 'binary');

            res.json({
                message: "Video uploaded successfully.",
                video: `${filename}`,
            });
        } catch (err) {
            console.error('Error handling file upload:', err);
            return res.status(500).json({ error: "Internal server error" });
        }
    });

    req.on("error", () => {
        res.status(500).json({ error: "Error receiving the file." });
    });
});

module.exports = router;