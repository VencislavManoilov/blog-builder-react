import { useEffect, useState } from "react";
import Editor from "./Editor";
import axios from "axios";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

function AdminPanel() {
    const [structure, setStruct] = useState({});

    useEffect(() => {
        const fetchStructure = async () => {
            try {
                const response = await axios.get(`${URL}/structure`);
                setStruct(response.data);
            } catch (err) {
                console.error("Error:", err);
            }
        };

        fetchStructure();
    }, []);

    // Function to rename a file or directory
    const handleRename = async (oldPath) => {
        const newName = prompt("Enter the new name for the file or directory:");
        if (!newName) {
            return; // If no name is entered, do nothing
        }

        const newPath = oldPath.substring(0, oldPath.lastIndexOf("/") + 1) + newName;

        try {
            await axios.put(`${URL}/page/rename`, {
                oldPagePath: oldPath,
                newPagePath: newPath,
            });
            alert("Renamed successfully!");
            // Fetch the updated structure after renaming
            const response = await axios.get(`${URL}/structure`);
            setStruct(response.data);
        } catch (err) {
            console.error("Error renaming:", err);
            alert("Error renaming file or directory.");
        }
    };

    const handleDelete = async (pagePath) => {
        if(window.confirm("Are you sure?") == false) {
            return;
        }

        if(!pagePath) {
            return;
        }

        let path = pagePath;

        if(pagePath[0] == "/") {
            path = pagePath.slice(1);
        }

        try {
            await axios.delete(URL+"/delete/page", {
                params: {pagePath: path}
            });

            alert("Deleted successfully");

            const response = await axios.get(`${URL}/structure`);
            setStruct(response.data);
        } catch (err) {
            console.error("Error deleting:", err);
            alert("Error deleting file or directory");
        }
    }

    const renderStructure = (struct) => {
        return Object.entries(struct).map(([path, info]) => {
            // Replace backslashes with forward slashes for consistency
            const cleanPath = path.replace(/\\/g, '/');
    
            if (info.type === "directory") {
                return (
                    <div key={cleanPath}>
                        {/* Display directory name */}
                        <strong style={{marginRight: "12px"}}>{cleanPath}:</strong>
                        <button onClick={() => handleRename(cleanPath)}>Rename</button>
                        <button onClick={() => handleDelete(cleanPath)}>Delete</button>
                        <div style={{ paddingLeft: "20px" }}>
                            {/* Render subdirectories and files */}
                            {info.contents && info.contents.map((fileName) => {
                                const fullPath = `${cleanPath}/${fileName}`;
                                return (
                                    <div key={fullPath}>
                                        <a href={`/page${fullPath}`} style={{marginRight: "12px"}}>{fileName}</a>
                                        <button onClick={() => handleRename(fullPath)}>Rename</button>
                                        <button onClick={() => {document.location.href = `/admin/edit${fullPath}`}}>Edit</button>
                                        <button onClick={() => handleDelete(fullPath)}>Delete</button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            } else if (info.type === "file") {
                return (
                    <div key={cleanPath}>
                        <a href={`/page${cleanPath}`} style={{marginRight: "12px"}}>{cleanPath}</a>
                        <button onClick={() => handleRename(cleanPath)}>Rename</button>
                        <button onClick={() => {document.location.href = `/admin/edit${cleanPath}`}}>Edit</button>
                        <button onClick={() => handleDelete(cleanPath)}>Delete</button>
                    </div>
                );
            }
            return null;
        });
    };

    const Structure = () => {
        return (
            <div>
                <button onClick={() => {document.location.href = "/admin/create"}}>Create</button>

                <h2>Page Structure</h2>
                {/* {structure == true ? renderStructure(structure) : <h3>Empty</h3>} */}
                {renderStructure(structure)}
            </div>
        );
    }

    return (
        <div>
            <h1 id="title" >Admin Panel</h1>
            <Routes>
                <Route path="/" element={<Structure />} />
                <Route path="/create" element={<Editor structure={structure} />} />
                <Route path="/edit/*" element={<Editor structure={structure} />} />
            </Routes>
        </div>
    );
}

export default AdminPanel;