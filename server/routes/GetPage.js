const express = require("express");
const router = express.Router();

router.get("/:pagePath*", (req, res) => {
    const pagePath = req.params.pagePath + (req.params[0] || "");
    const htmlFilePath = path.join(UPLOADS_DIR, pagePath, "index.html");

    if (fs.existsSync(htmlFilePath)) {
        res.sendFile(htmlFilePath);
    } else {
        res.status(404).json({ error: "Page not found" });
    }
})

module.exports = router;