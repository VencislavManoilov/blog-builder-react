import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ContentEditable from 'react-contenteditable';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../index.css';

const URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

// Register fonts
const Font = Quill.import('formats/font');
Font.whitelist = ['arial', 'times-new-roman', 'courier-new', 'verdana', 'georgia', 'trebuchet-ms', 'comic-sans-ms', 'impact'];
Quill.register(Font, true);

const MyCustomToolbar = () => (
    <div id="toolbar">
        <select className="ql-font">
            <option value="">Normal</option>
            <option value="arial">Arial</option>
            <option value="times-new-roman">Times New Roman</option>
            <option value="courier-new">Courier New</option>
            <option value="verdana">Verdana</option>
            <option value="georgia">Georgia</option>
            <option value="trebuchet-ms">Trebuchet MS</option>
            <option value="comic-sans-ms">Comic Sans MS</option>
            <option value="impact">Impact</option>
        </select>
        <select className="ql-header" defaultValue="">
            <option value="">Normal</option>
            <option value="1">Header 1</option>
            <option value="2">Header 2</option>
            <option value="3">Header 3</option>
        </select>
        <button className="ql-bold" />
        <button className="ql-italic" />
        <button className="ql-underline" />
        <button className="ql-strike" />
        <button className="ql-list" value="ordered" />
        <button className="ql-list" value="bullet" />
        <button className="ql-link" />
        <button className="ql-image" />
        <select className="ql-align" defaultValue="">
            <option value="" />
            <option value="left" />
            <option value="center" />
            <option value="right" />
            <option value="justify" />
        </select>
        <button className="ql-clean" />
    </div>
);

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
                content: type === "title" ? "Enter Title" : type === "text" ? "Enter your text" : type === "formated" ? "Type here"  : type === "html" ? "Enter your html" : type === "formated" ? "" : type === "image" ? "" : "",
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
        <div className="Setting_buttons">
            
            <br />
            <br />

            <div>
                <input
                    id="Page_Title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Page Title"
                    style={{ display: "block" }}
                />
                <input
                    id="Path_Input"
                    type="text"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="Path (e.g., pateta or about-us/our-team)"
                    style={{display: "block" }}
                />
                <div className="Add_buttons">
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
                </div>
                <button id="Save_button" onClick={savePage}>Save Page</button>
                <button id="home_button" onClick={() => { document.location.href = "/admin" }}>Home</button>
            </div>

            <div className="line"></div>

            <div>
                {schema.map((element) => (
                    <div key={element.id}>
                        {element.type === "title" && (
                            <ContentEditable
                                html={element.content}
                                onChange={(e) => updateElement(element.id, e.target.value)}
                                tagName="h2"
                                id="Added_Title"
                            />
                        )}
                        {element.type === "text" && (
                            <ContentEditable
                                html={element.content}
                                onChange={(e) => updateElement(element.id, e.target.value)}
                                tagName="p"
                                id="Added_Text"
                            />
                        )}
                        {element.type === "html" && (
                            <ContentEditable
                                html={element.content}
                                onChange={(e) => updateElement(element.id, e.target.value)}
                                tagName="p"
                                id="Added_Html"
                            />
                        )}
                        {element.type === "image" && (
                            <div id="Added_One_Image">

                                <img id="Added_One_Image_img" src={element.content} alt="image"  />
                                <br></br>
                                <input
                                    id="Added_One_Image_file"
                                    type="file"
                                    onChange={(e) => updateElement(element.id, e.target.files[0], element.type)}
                                    placeholder="Choose Image"
                                    />
                                
                            </div>
                        )}
                        {element.type === "two_images" && (
                            <div id="Added_Two_Images">
                                <img id="Added_Two_Images_img_one" src={element.content[0]} alt="Image 1"/>
                                <img id="Added_Two_Images_img_two" src={element.content[1]} alt="Image 2"/>

                                <br></br>

                                <input
                                    type="file"
                                    onChange={(e) => updateElement(element.id, {id: 0, file: e.target.files[0]}, "two_images")}
                                    placeholder="Choose Image 1"
                                    id="Added_Two_Images_file_one"
                                />
                                <input
                                    type="file"
                                    onChange={(e) => updateElement(element.id, {id: 1, file: e.target.files[0]}, "two_images")}
                                    placeholder="Choose Image 2"
                                    id="Added_Two_Images_file_two"
                                />
                                
                            </div>
                        )}
                        {element.type === "four_images" && (
                            <div id="Added_Four_Images">
                                <img id="Added_Four_Images_img_one" src={element.content[0]} alt="Image 1"/>
                                <img id="Added_Four_Images_img_two" src={element.content[1]} alt="Image 2"/>
                                <br></br>
                                <img id="Added_Four_Images_img_three" src={element.content[2]} alt="Image 3"/>
                                <img id="Added_Four_Images_img_four" src={element.content[3]} alt="Image 4"/>
                                <br></br>
                                <input 
                                    type="file"
                                    onChange={(e) => updateElement(element.id, {id: 0, file: e.target.files[0]}, "four_images")}
                                    placeholder="Choose Image 1"
                                    id="Added_Four_Images_file_one"
                                />
                                <input
                                    type="file"
                                    onChange={(e) => updateElement(element.id, {id: 1, file: e.target.files[0]}, "four_images")}
                                    placeholder="Choose Image 2"
                                    id="Added_Four_Images_file_two"
                                />
                                <input
                                    type="file"
                                    onChange={(e) => updateElement(element.id, {id: 2, file: e.target.files[0]}, "four_images")}
                                    placeholder="Choose Image 3"
                                    id="Added_Four_Images_file_three"
                                />
                                <input
                                    type="file"
                                    onChange={(e) => updateElement(element.id, {id: 3, file: e.target.files[0]}, "four_images")}
                                    placeholder="Choose Image 4"
                                    id="Added_Four_Images_file_four"
                                />
                                
                            </div>
                        )}
                        {element.type === "video" && (
                            <div id="Added_Video">
                                <video id="Added_Video_vid" src={element.content} controls />
                                <br></br>
                                <input
                                    id="Added_Video_file"
                                    type="file"
                                    onChange={(e) => updateElement(element.id, e.target.files[0], element.type)}
                                    placeholder="Choose Video"
                                />
                                
                            </div>
                        )}
                        {element.type === "menu" && (
                            <div id="Added_menu">
                                <label>Select Directory: </label>
                                <select id="Added_menu_select" value={element.selectedDirectory} onChange={(e) => selectDirectory(element.id, e.target.value)}>
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
                            <div id="Added_Formated">
                                <MyCustomToolbar /> {/* Include the custom toolbar */}
                                <ReactQuill
                                    value={element.content}
                                    onChange={(newContent) => updateElement(element.id, newContent)}
                                    modules={{
                                        toolbar: {
                                            container: '#toolbar', // Use the custom toolbar
                                        },
                                    }}
                                />
                            </div>
                        )}
                        {element.type === "youtube" && (
                            <div id="Added_YouTube">
                                {element.content?.url && (
                                    <iframe
                                        id="Added_YouTube_vid"
                                        width="420"
                                        height="250"
                                        key={`${element.content.url}-${element.content.allowFullscreen}`}
                                        src={element.content.url}
                                        allowFullScreen={element.content.allowFullscreen} // Conditionally add the allowFullScreen attribute
                                    />
                                )}
                                <br></br>
                                <input
                                    id="Added_YouTube_link"
                                    type="text"
                                    onChange={(e) => { updateElement(element.id, {url: e.target.value}, "youtube"); }}
                                    placeholder="YouTube URL"
                                />
                                <label>
                                    <input
                                        id="Added_YouTube_allow"
                                        type="checkbox"
                                        checked={element.content.allowFullscreen}
                                        onChange={(e) => {
                                            updateElement(element.id, { allowFullscreen: e.target.checked }, "youtube");
                                        }}
                                    />
                                    Allow Fullscreen
                                </label>
                            </div>
                        )}
                        {element.type === "separation" && (
                            <div className="line"></div>
                        )}
                        <button id="Delete_button" onClick={() => deleteElement(element.id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Editor;