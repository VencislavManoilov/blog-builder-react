const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 8080;

// Middleware for parsing JSON requests and incoming form-data requests
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Setting the CORS Policy
app.use(cors({
    origin: "*",
    optionsSuccessStatus: 200
}));

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
        const contents = [];
        let isFile = false;

        items.forEach(item => {
            const subPath = path.join(currentPath, item.name);

            if (item.isDirectory()) {
                // Recursively scan the subdirectory and add its name to contents
                scanDirectory(path.join(dir, item.name), subPath);
                contents.push(item.name);
            } else if (item.name === "index.html" || item.name === "schema.json") {
                // If the directory contains index.html or schema.json, mark it as a file
                isFile = true;
            }
        });

        if (isFile) {
            structure[currentPath] = { type: 'file' };
        } else if (contents.length > 0) {
            structure[currentPath] = {
                type: 'directory',
                contents: contents
            };
        }
    }

    // Start scanning from the root directory
    scanDirectory(UPLOADS_DIR, "/");

    // Clean up the structure: removing any directory's files that are already listed in contents
    const finalStructure = {};

    Object.keys(structure).forEach(key => {
        // Skip the root directory "/"
        if (key === "/") return;

        if (structure[key].type === 'file' || structure[key].type === 'directory') {
            // Avoid adding subdirectories that are already in their parent's contents
            const parentPath = path.dirname(key);
            if (structure[parentPath]?.contents?.includes(path.basename(key))) {
                return;
            }
            finalStructure[key] = structure[key];
        }
    });

    return finalStructure;
}

// Serve static HTML pages based on path
app.get("/page-get", (req, res) => {
    const pagePath = req.query.pagePath;
    const htmlFilePath = path.join(UPLOADS_DIR, pagePath, "index.html");
    const schemaFilePath = path.join(UPLOADS_DIR, pagePath, "schema.json");

    if (pagePath && fs.existsSync(htmlFilePath) && fs.existsSync(schemaFilePath)) {
        try {
            const htmlFileContent = fs.readFileSync(htmlFilePath, 'utf-8');
            const schemaContent = JSON.parse(fs.readFileSync(schemaFilePath, 'utf-8')).title;
            res.status(200).json({
                content: htmlFileContent,
                title: schemaContent
            });
        } catch (error) {
            res.status(500).json({ error: "Error reading schema" });
        }
    } else {
        res.status(404).json({ error: "Page not found" });
    }
});

// Serve the page's schema
app.get("/page-get-schema", (req, res) => {
    const pagePath = req.query.pagePath;
    const schemaFilePath = path.join(UPLOADS_DIR, pagePath, "schema.json");

    if(fs.existsSync(schemaFilePath)) {
        try {
            const schemaContent = fs.readFileSync(schemaFilePath, 'utf-8');
            res.status(200).json({
                schema: JSON.parse(schemaContent)
            });
        } catch (error) {
            res.status(500).json({ error: "Error reading schema" });
        }
    } else {
        res.status(404).json({ error: "Schema not found" });
    }
})

// Get the full directory structure
app.get("/structure", (req, res) => {
    const structure = GetStructure();
    res.status(200).json(structure);
});

// POST request to create/save a new page with schema and HTML content
const CreatePage = require("./routes/CreatePage");
app.use("/page", (req, res, next) => {
    req.UPLOADS_DIR = UPLOADS_DIR;
    next();
}, CreatePage);

// POST request to edit an existing page
const EditPage = require("./routes/EditPage");
app.use("/page/edit", (req, res, next) => {
    req.UPLOADS_DIR = UPLOADS_DIR;
    next();
}, EditPage);

const RenamePage = require("./routes/RenamePage");
app.use("/page/rename", (req, res, next) => {
    req.UPLOADS_DIR = UPLOADS_DIR;
    next();
}, RenamePage);

// DELETE request to delete a page
const DeletePage = require("./routes/DeletePage");
app.use("/delete/page", (req, res, next) => {
    req.UPLOADS_DIR = UPLOADS_DIR;
    next();
}, DeletePage);

const Image = require("./routes/Image");
app.use("/image", Image);

const Video = require("./routes/Video");
app.use("/video", Video);

// Start the server
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
    
    // Load the structure at startup
    console.log(GetStructure());
});