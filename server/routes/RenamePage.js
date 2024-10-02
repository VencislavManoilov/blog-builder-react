const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

router.put("/", (req, res) => {
    const { oldPagePath, newPagePath } = req.body;

    // Validate inputs
    if (!oldPagePath || !newPagePath) {
        return res.status(400).json({ error: "Missing old page path or new page path." });
    }

    // Create full paths
    const oldFullPath = path.join(req.UPLOADS_DIR, oldPagePath);
    const newFullPath = path.join(req.UPLOADS_DIR, newPagePath);

    // Check if the old path exists
    if (!fs.existsSync(oldFullPath)) {
        return res.status(404).json({ error: "Old page path does not exist." });
    }

    // Check if the new path already exists to avoid overwriting
    if (fs.existsSync(newFullPath)) {
        return res.status(400).json({ error: "New page path already exists." });
    }

    try {
        // Rename directory or file
        fs.renameSync(oldFullPath, newFullPath);
        res.status(200).json({ message: "Page renamed successfully." });
    } catch (error) {
        console.error("Error renaming page:", error);
        res.status(500).json({ error: "An error occurred while renaming the page." });
    }
});

module.exports = router;