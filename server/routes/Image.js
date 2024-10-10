const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

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

        fs.access(path.join(__dirname, "..", "files", "images"), fs.constants.F_OK, (err) => {
            if (err) {
                // Directory doesn't exist, create it
                fs.mkdir(path.join(__dirname, "..", "files", "images"), { recursive: true }, (err) => {
                    if (err) {
                        console.error('Error creating directory:', err);
                        return res.status(500).json({ error: "Internal server error" });
                    }
                });
            }
        });

        // Write the file using fs
        fs.writeFile(savePath, buffer, 'binary', err => {
            if(err) {
                console.log(err);
                return res.status(500).json({ error: "Error saving the file." });
            }

            res.json({
                message: "File uploaded successfully.",
                image: `${filename}`,
            });
        });
    });
  
    // Handle any errors in the stream
    req.on("error", () => {
        res.status(500).json({ error: "Error receiving the file." });
    });
});

module.exports = router;