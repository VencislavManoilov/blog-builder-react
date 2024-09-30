import { useEffect, useState } from "react";
import ContentEditable from 'react-contenteditable';
import { v4 as uuidv4 } from 'uuid';

function Editor() {
    const [schema, setSchema] = useState([]);
    const [title, setTitle] = useState("Untitled Page");

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
    const savePage = () => {
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

        // Add request to the backend
    };

    return (
        <div>
            <button onClick={() => {document.location.href = "/admin"}}>Home</button>
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