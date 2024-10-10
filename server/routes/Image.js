const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

router.get("/", (req, res) => {
    const { name } = req.body;

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

router.post("/", (req, res) => {
    let imageData = [];
    let filename = '';
  
    // Get the content type from the request (e.g., 'image/png', 'image/jpeg')
    const contentType = req.headers['content-type'];
  
    // Generate a filename based on content-type if available
    if (contentType) {
        const ext = contentType.split("/")[1]; // Extract 'png' from 'image/png', etc.
        filename = `image-${Date.now()}.${ext}`;
    } else {
        // Fallback to .bin if no content type is specified (or unknown)
        filename = `file-${Date.now()}.bin`;
    }
    
    // Listen to the data stream
    req.on("data", chunk => {
        imageData.push(chunk);
    });
  
    // Handle the 'end' event when the file has been fully uploaded
    req.on("end", () => {
        const buffer = Buffer.concat(imageData); // Combine all chunks
        const savePath = path.join(__dirname, "..", "files", "images", filename);

        // Ensure the directory exists (synchronously)
        const imageDir = path.join(__dirname, "..", "files", "images");

        try {
            if (!fs.existsSync(imageDir)) {
                // Synchronously create the directory
                fs.mkdirSync(imageDir, { recursive: true });
            }

            // Write the file
            fs.writeFileSync(savePath, buffer, 'binary');

            res.json({
                message: "Video uploaded successfully.",
                image: `${filename}`,
            });
        } catch (err) {
            console.error('Error handling file upload:', err);
            return res.status(500).json({ error: "Internal server error" });
        }
    });
  
    // Handle any errors in the stream
    req.on("error", () => {
        res.status(500).json({ error: "Error receiving the file." });
    });
});

module.exports = router;