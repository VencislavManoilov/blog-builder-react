import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ContentEditable from 'react-contenteditable';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

function Editor() {
    const { '*': editPath } = useParams();

    const [schema, setSchema] = useState([]);
    const [title, setTitle] = useState("Untitled Page");
    const [path, setPath] = useState("");

    useEffect(() => {
        if (editPath) {
            const fetchPage = async () => {
                try {
                    const response = await axios.get(`${URL}/page-get-schema?pagePath=${editPath}`);
                    setSchema(response.data.schema.schema);
                    setTitle(response.data.schema.title);
                } catch (error) {
                    console.error("Error fetching page content:", error);
                }
            };

            fetchPage();
            setPath(editPath);
        }
    }, [editPath]);

    // Adds new element to schema (text, image, video)
    const addElement = (type) => {
        const newElement = {
            id: uuidv4(),
            type,
            content: type === "text" ? "Enter your text" : type === "image" ? "Image URL" : "Video URL",
        };
        setSchema([...schema, newElement]);
    };

    // Updates the content of an element in the schema
    const updateElement = (id, newContent) => {
        setSchema(schema.map(el => el.id === id ? { ...el, content: newContent } : el));
    };

    // Deletes an element from the schema
    const deleteElement = (id) => {
        setSchema(schema.filter(el => el.id !== id));
    };

    // Generates static HTML file and saves the schema for future editing
    const savePage = async () => {
        // Create HTML string
        let htmlContent = `<html><head><title>${title}</title></head><body>`;
        schema.forEach(element => {
            if (element.type === "text") {
                htmlContent += `<p>${element.content}</p>`;
            } else if (element.type === "image") {
                htmlContent += `<img src="${element.content}" alt="image" />`;
            } else if (element.type === "video") {
                htmlContent += `<video src="${element.content}" controls></video>`;
            }
        });
        htmlContent += `</body></html>`;

        const schemaContent = { title, schema };

        // Send request to the backend to save the page
        try {
            await axios.post(URL+"/page", {
                pagePath: path,
                htmlContent,
                schema: schemaContent
            });
            alert("Page saved successfully!");
            setTitle("Untitled Page"); // Reset title
            setSchema([]); // Reset schema
            setPath(""); // Reset path
        } catch (error) {
            console.error("Error saving page:", error);
            alert("Failed to save page.");
        }
    };

    return (
        <div>
            <button onClick={() => { document.location.href = "/admin" }}>Home</button>
            <br />
            <br />

            <div>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Page Title"
                    style={{ fontSize: "24px", marginBottom: "20px", display: "block" }}
                />
                <input
                    type="text"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="Path (e.g., pateta or about-us/our-team)"
                    style={{ marginBottom: "20px", display: "block" }}
                />
                <button onClick={() => addElement("text")}>Add Text</button>
                <button onClick={() => addElement("image")}>Add Image</button>
                <button onClick={() => addElement("video")}>Add Video</button>
                <button onClick={savePage}>Save Page</button>
            </div>

            <div>
                {schema.map((element) => (
                    <div key={element.id} style={{ marginBottom: "20px" }}>
                        {element.type === "text" && (
                            <ContentEditable
                                html={element.content}
                                onChange={(e) => updateElement(element.id, e.target.value)}
                                tagName="p"
                            />
                        )}
                        {element.type === "image" && (
                            <div>
                                <input
                                    type="text"
                                    value={element.content}
                                    onChange={(e) => updateElement(element.id, e.target.value)}
                                    placeholder="Image URL"
                                />
                                <img src={element.content} alt="image" style={{ width: "200px", height: "auto" }} />
                            </div>
                        )}
                        {element.type === "video" && (
                            <div>
                                <input
                                    type="text"
                                    value={element.content}
                                    onChange={(e) => updateElement(element.id, e.target.value)}
                                    placeholder="Video URL"
                                />
                                <video src={element.content} controls style={{ width: "300px", height: "auto" }} />
                            </div>
                        )}
                        <button onClick={() => deleteElement(element.id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Editor;