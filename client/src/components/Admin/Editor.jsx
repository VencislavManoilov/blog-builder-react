import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ContentEditable from 'react-contenteditable';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

function Editor({ structure }) {
    const { '*': editPath } = useParams();

    const [schema, setSchema] = useState([]);
    const [title, setTitle] = useState("Untitled Page");
    const [path, setPath] = useState("");

    useEffect(() => {
        if (editPath && editPath !== "create") {
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

    const decodeHTML = (html) => {
        const textArea = document.createElement("textarea");
        textArea.innerHTML = html;
        return textArea.value;
    };

    // Adds new element to schema (text, image, video, menu)
    const addElement = (type) => {
        let newElement;

        if (type === "menu") {
            newElement = {
                id: uuidv4(),
                type,
                content: [], // Will hold the directory's page names
                selectedDirectory: "", // Stores the selected directory
            };
        } else {
            newElement = {
                id: uuidv4(),
                type,
                content: type === "title" ? "Enter Title" : type === "text" ? "Enter your text" : type === "html" ?"Enter your html" : type === "image" ? "Image URL" : "Video URL",
            };
        }
        
        setSchema([...schema, newElement]);
    };

    // Updates the content of an element in the schema
    const updateElement = (id, newContent) => {
        setSchema(schema.map(el => el.id === id ? { ...el, content: newContent } : el));
    };

    // Handles the selection of a directory for the menu
    const selectDirectory = (id, directory) => {
        const contents = structure[directory]?.contents || [];
        setSchema(schema.map(el => el.id === id ? { ...el, selectedDirectory: directory, content: contents } : el));
    };

    // Deletes an element from the schema
    const deleteElement = (id) => {
        setSchema(schema.filter(el => el.id !== id));
    };

    // Generates static HTML file and saves the schema for future editing
    const savePage = async () => {
        // Create HTML string
        let htmlContent = ``;
        schema.forEach(element => {
            if (element.type === "title") {
                htmlContent += `<h2>${element.content}</h2>`;
            } else if (element.type === "text") {
                htmlContent += `<p>${element.content}</p>`;
            } else if (element.type === "html") {
                htmlContent += decodeHTML(element.content);
                htmlContent += "<br />";
            } else if (element.type === "image") {
                htmlContent += `<img src="${element.content}" alt="image" />`;
            } else if (element.type === "video") {
                htmlContent += `<video src="${element.content}" controls></video>`;
            } else if (element.type === "menu") {
                if (element.content.length > 0) {
                    htmlContent += `<select onchange="location.href=this.value;">`;
                    htmlContent += `<option value="">${element.selectedDirectory.slice(1)}</option>`
                    element.content.forEach(page => {
                        htmlContent += `<option value="/page${element.selectedDirectory}/${page}">${page}</option>`;
                    });
                    htmlContent += `</select>`;
                }
            } else if (element.type === "formated"){
                htmlContent += element.content;
            }
        });

        const schemaContent = { title, schema };

        // Send request to the backend to save the page
        try {
            const editUrl = (editPath === "create") ? `${URL}/page` : `${URL}/page/edit`;
            await axios.post(editUrl, {
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
                <button onClick={() => addElement("title")}>Add Title</button>
                <button onClick={() => addElement("text")}>Add Text</button>
                <button onClick={() => addElement("html")}>Add html</button>
                <button onClick={() => addElement("image")}>Add Image</button>
                <button onClick={() => addElement("video")}>Add Video</button>
                <button onClick={() => addElement("formated")}>Add Formated Text</button>
                <button onClick={() => addElement("menu")}>Add Menu</button>
                <button onClick={savePage}>Save Page</button>
            </div>

            <div>
                {schema.map((element) => (
                    <div key={element.id} style={{ marginBottom: "20px" }}>
                        {element.type === "title" && (
                            <ContentEditable
                                html={element.content}
                                onChange={(e) => updateElement(element.id, e.target.value)}
                                tagName="h2"
                            />
                        )}
                        {element.type === "text" && (
                            <ContentEditable
                                html={element.content}
                                onChange={(e) => updateElement(element.id, e.target.value)}
                                tagName="p"
                            />
                        )}
                        {element.type === "html" && (
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
                        {element.type === "menu" && (
                            <div>
                                <label>Select Directory: </label>
                                <select value={element.selectedDirectory} onChange={(e) => selectDirectory(element.id, e.target.value)}>
                                    <option value="">Select a directory</option>
                                    {Object.keys(structure).map((dir) => (
                                        structure[dir].type === "directory" && (
                                            <option key={dir} value={dir}>{dir}</option>
                                        )
                                    ))}
                                </select>
                                {element.content.length > 0 && (
                                    <ul>
                                        {element.content.map((page, index) => (
                                            <li key={index}>{page}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                        {element.type === "formated" && (
                            <div>
                                  <ReactQuill
                                value={element.content}
                                onChange={(newContent) => updateElement(element.id, newContent)}
                                modules={{
                                    toolbar: [
                                        [{ header: [1, 2, 3, false] }],
                                        ['bold', 'italic', 'underline', 'strike'],
                                        [{ list: 'ordered' }, { list: 'bullet' }],
                                        ['link', 'image'],
                                        [{ align: [] }],
                                        ['clean'],
                                    ],
                                }}
                            />
                            </div>
                        )
                        }
                        <button onClick={() => deleteElement(element.id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Editor;