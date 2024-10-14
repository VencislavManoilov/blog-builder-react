import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ContentEditable from 'react-contenteditable';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../index.css';

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
        } else if (type === "two_images") {
            newElement = {
                id: uuidv4(),
                type,
                content: ["Image URL 1", "Image URL 2"],
            };
        } else if (type === "four_images") {
            newElement = {
                id: uuidv4(),
                type,
                content: ["Image URL 1", "Image URL 2", "Image URL 3", "Image URL 4"],
            };
        } else if (type === "youtube") {
            newElement = {
                id: uuidv4(),
                type,
                content: {
                    url: "",
                    allowFullscreen: false
                }
            }
        } else if (type === "separation") {
            newElement = {
                id: uuidv4(),
                type
            }
        } else {
            newElement = {
                id: uuidv4(),
                type,
                content: type === "title" ? "Enter Title" : type === "text" ? "Enter your text" : type === "html" ? "Enter your html" : type === "formated" ? "" : type === "image" ? "" : "",
            };
        }
        
        setSchema([...schema, newElement]);
    };

    // Updates the content of an element in the schema
    const updateElement = async (id, newContent, type) => {
        const formData = new FormData();
        switch(type) {
            case "image":
                formData.append("image", newContent);
                
                await axios.post(URL + "/image", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                })
                .then(response => {
                    const image = response.data.image;
                    setSchema(schema.map(el => el.id === id ? { ...el, content: URL + "/image?name=" + image } : el));
                })
                .catch(error => {
                    console.error("Error uploading image:", error);
                });
            break;
            case "video":
                formData.append("video", newContent);
                
                await axios.post(URL + "/video", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                })
                .then(response => {
                    const video = response.data.video;
                    setSchema(schema.map(el => el.id === id ? { ...el, content: URL + "/video?name=" + video } : el));
                })
                .catch(error => {
                    console.error("Error uploading image:", error);
                });
            break;
            case "youtube":
                if(newContent?.url) {
                    // Extract the video ID from the YouTube URL
                    const youtubeUrl = newContent.url;
                    const videoIdMatch = youtubeUrl.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})|youtu\.be\/([a-zA-Z0-9_-]{11})/);
                    const videoId = videoIdMatch ? videoIdMatch[1] || videoIdMatch[2] : null;

                    schema.map(el => el.id === id && console.log(el));
                    setSchema(schema.map(el => el.id === id ? { ...el, content: {...el.content, url: `https://www.youtube.com/embed/${videoId}`} } : el));
                } else {
                    setSchema(schema.map(el => el.id === id ? { ...el, content: {...el.content, allowFullscreen: newContent.allowFullscreen} } : el));
                }
            break;
            default:
                if(type === "two_images" || type === "four_images") {
                    formData.append("image", newContent.file);
                
                    await axios.post(URL + "/image", formData, {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        }
                    })
                    .then(response => {
                        const image = response.data.image;
                        return setSchema(schema.map(el => el.id === id ? { ...el, content: { ...el.content, [newContent.id]: URL + "/image?name=" + image } } : el));
                    })
                    .catch(error => {
                        return console.error("Error uploading image:", error);
                    });
                } else {
                    setSchema(schema.map(el => el.id === id ? { ...el, content: newContent } : el));
                }
            break;
        }
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
        if(!path) {
            return alert("You need to specify path");
        }

        if(schema.length === 0) {
            return alert("You need to place some content");
        }

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
                htmlContent += `<img class="one_image" src="${element.content}" alt="image" />`;
            } else if (element.type === "two_images") {
                htmlContent += `<div class="two_images"><img src="${element.content[0]}" alt="image" /><img src="${element.content[1]}" alt="image" /></div>`
            } else if (element.type === "four_images") {
                htmlContent += `<div class="four_images"><img src="${element.content[0]}" alt="image" /><img src="${element.content[1]}" alt="image" /><img src="${element.content[2]}" alt="image" /><img src="${element.content[3]}" alt="image" /></div>`
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
            } else if (element.type === "formated") {
                htmlContent += element.content;
            } else if (element.type === "youtube") {
                htmlContent += `<iframe width="420" height="250" src=${element.content.url} ${element.content.allowFullscreen ? "allowfullscreen" : ""} ></iframe><br />`
            } else if (element.type === "separation") {
                htmlContent += "<div class='line'></div>";
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
                <button onClick={() => addElement("separation")}>Add separation line</button>
                <button onClick={() => addElement("image")}>Add Image</button>
                <button onClick={() => addElement("two_images")}>Add Two Images</button>
                <button onClick={() => addElement("four_images")}>Add Four Images</button>
                <button onClick={() => addElement("video")}>Add Video</button>
                <button onClick={() => addElement("formated")}>Add Formated Text</button>
                <button onClick={() => addElement("youtube")}>YouTube video</button>
                <button onClick={() => addElement("menu")}>Add Menu</button>
                <button onClick={savePage}>Save Page</button>
            </div>

            <div className="line"></div>

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
                                    type="file"
                                    onChange={(e) => updateElement(element.id, e.target.files[0], element.type)}
                                    placeholder="Choose Image"
                                />
                                <img src={element.content} alt="image" style={{ width: "200px", height: "auto" }} />
                            </div>
                        )}
                        {element.type === "two_images" && (
                            <div>
                                <input
                                    type="file"
                                    onChange={(e) => updateElement(element.id, {id: 0, file: e.target.files[0]}, "two_images")}
                                    placeholder="Choose Image 1"
                                />
                                <input
                                    type="file"
                                    onChange={(e) => updateElement(element.id, {id: 1, file: e.target.files[0]}, "two_images")}
                                    placeholder="Choose Image 2"
                                />
                                <img src={element.content[0]} alt="Image 1" style={{ width: "200px", height: "auto" }} />
                                <img src={element.content[1]} alt="Image 2" style={{ width: "200px", height: "auto" }} />
                            </div>
                        )}
                        {element.type === "four_images" && (
                            <div>
                                <input
                                    type="file"
                                    onChange={(e) => updateElement(element.id, {id: 0, file: e.target.files[0]}, "four_images")}
                                    placeholder="Choose Image 1"
                                />
                                <input
                                    type="file"
                                    onChange={(e) => updateElement(element.id, {id: 1, file: e.target.files[0]}, "four_images")}
                                    placeholder="Choose Image 2"
                                />
                                <input
                                    type="file"
                                    onChange={(e) => updateElement(element.id, {id: 2, file: e.target.files[0]}, "four_images")}
                                    placeholder="Choose Image 3"
                                />
                                <input
                                    type="file"
                                    onChange={(e) => updateElement(element.id, {id: 3, file: e.target.files[0]}, "four_images")}
                                    placeholder="Choose Image 4"
                                />
                                <img src={element.content[0]} alt="Image 1" style={{ width: "200px", height: "auto" }} />
                                <img src={element.content[1]} alt="Image 2" style={{ width: "200px", height: "auto" }} />
                                <img src={element.content[2]} alt="Image 3" style={{ width: "200px", height: "auto" }} />
                                <img src={element.content[3]} alt="Image 4" style={{ width: "200px", height: "auto" }} />
                            </div>
                        )}
                        {element.type === "video" && (
                            <div>
                                <input
                                    type="file"
                                    onChange={(e) => updateElement(element.id, e.target.files[0], element.type)}
                                    placeholder="Choose Video"
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
                        )}
                        {element.type === "youtube" && (
                            <div>
                                <input
                                    type="text"
                                    onChange={(e) => { updateElement(element.id, {url: e.target.value}, "youtube"); }}
                                    placeholder="YouTube URL"
                                />
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={element.content.allowFullscreen}
                                        onChange={(e) => {
                                            updateElement(element.id, { allowFullscreen: e.target.checked }, "youtube");
                                        }}
                                    />
                                    Allow Fullscreen
                                </label>
                                {element.content?.url && (
                                    <iframe
                                        width="420"
                                        height="250"
                                        key={`${element.content.url}-${element.content.allowFullscreen}`}
                                        src={element.content.url}
                                        allowFullScreen={element.content.allowFullscreen} // Conditionally add the allowFullScreen attribute
                                    />
                                )}
                            </div>
                        )}
                        {element.type === "separation" && (
                            <div className="line"></div>
                        )}
                        <button onClick={() => deleteElement(element.id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Editor;