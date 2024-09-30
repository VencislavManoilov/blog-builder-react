const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8080;

// Middleware for parsing JSON requests
app.use(bodyParser.json());

// Directory for storing pages
const UPLOADS_DIR = path.join(__dirname, "uploads");

// Ensure the uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Function to scan the uploads directory structure
function GetStructure() {
    const structure = {};

    function scanDirectory(dir, currentPath) {
        const items = fs.readdirSync(dir, { withFileTypes: true });

        items.forEach(item => {
            if (item.isDirectory()) {
                const subPath = path.join(currentPath, item.name);
                structure[subPath] = { type: "directory" };
                scanDirectory(path.join(dir, item.name), subPath); // Recurse into subdirectory
            } else if (item.name === "index.html") {
                const pagePath = currentPath;
                structure[pagePath] = { type: "file" };
            }
        });
    }

    scanDirectory(UPLOADS_DIR, "/");
    console.log("Page Structure Loaded:", structure);
    return structure;
}

// Serve static HTML pages based on path
app.get("/page/:pagePath*", (req, res) => {
    const pagePath = req.params.pagePath + (req.params[0] || "");
    const htmlFilePath = path.join(UPLOADS_DIR, pagePath, "index.html");

    if (fs.existsSync(htmlFilePath)) {
        res.sendFile(htmlFilePath);
    } else {
        res.status(404).json({ error: "Page not found" });
    }
});

// Get the full directory structure
app.get("/structure", (req, res) => {
    const structure = GetStructure();
    res.status(200).json(structure);
});

// POST request to create/save a new page with schema and HTML content
app.post("/page", (req, res) => {
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
});

// POST request to edit an existing page
app.post("/page/edit", (req, res) => {
    const { path: pagePath, htmlContent, schema } = req.body;

    if (!pagePath || !htmlContent || !schema) {
        return res.status(400).json({ error: "Missing page path, HTML content, or schema." });
    }

    const fullPath = path.join(UPLOADS_DIR, pagePath);
    const htmlFilePath = path.join(fullPath, "index.html");
    const schemaFilePath = path.join(fullPath, "schema.json");

    if (!fs.existsSync(htmlFilePath) || !fs.existsSync(schemaFilePath)) {
        return res.status(404).json({ error: "Page not found." });
    }

    fs.writeFileSync(htmlFilePath, htmlContent);
    fs.writeFileSync(schemaFilePath, JSON.stringify(schema, null, 2));

    res.status(200).json({ message: "Page edited successfully." });
});

// DELETE request to delete a page
app.delete("/page", (req, res) => {
    const { path: pagePath } = req.body;

    if (!pagePath) {
        return res.status(400).json({ error: "Missing page path." });
    }

    const fullPath = path.join(UPLOADS_DIR, pagePath);
    
    if (fs.existsSync(fullPath)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        return res.status(200).json({ message: "Page deleted successfully." });
    } else {
        return res.status(404).json({ error: "Page not found." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
    
    // Load the structure at startup
    GetStructure();
});