const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

router.delete("/", (req, res) => {
    const { pagePath } = req.query;

    if (!pagePath) {
        return res.status(400).json({ error: "Missing page path." });
    }

    const fullPath = path.join(req.UPLOADS_DIR, pagePath);
    
    if (fs.existsSync(fullPath)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        return res.status(200).json({ message: "Page deleted successfully." });
    } else {
        return res.status(404).json({ error: "Page not found." });
    }
})

module.exports = router;