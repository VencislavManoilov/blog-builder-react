const express = require("express");
const app = express();
const PORT = 8080;

function GetStructure() {

} 

app.get("/", (req, res) => {
    res.status(200).json({message: "Welcome!"});
})

app.post("/page", (req, res) => {
    // Save the given page
    res.status(200).json({success: true});
})

app.post("/page/edit", (req, res) => {
    // Edit the page
    res.status(200).json({success: true});
})

app.delete("/page", (req, res) => {
    // Delete the page
    res.status(200).json({success: true});
})

app.listen(PORT, () => {
    console.log("Listening to", PORT);
    
    GetStructure();
})