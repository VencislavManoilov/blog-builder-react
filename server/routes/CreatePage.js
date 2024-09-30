const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
    const { path: pagePath, htmlContent, schema } = req.body;

    if (!pagePath || !htmlContent || !schema) {
        return res.status(400).json({ error: "Missing page path, HTML content, or schema." });
    }

    const fullPath = path.join(UPLOADS_DIR, pagePath);
    const htmlFilePath = path.join(fullPath, "index.html");
    const schemaFilePath = path.join(fullPath, "schema.json");

    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }

    fs.writeFileSync(htmlFilePath, htmlContent);
    fs.writeFileSync(schemaFilePath, JSON.stringify(schema, null, 2));

    res.status(201).json({ message: "Page created successfully." });
})

module.exports = router;