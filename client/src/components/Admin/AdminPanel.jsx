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

    const renderStructure = (struct) => {
        return Object.entries(struct).map(([path, info]) => {
            // Replace backslashes with forward slashes for consistency
            const cleanPath = path.replace(/\\/g, '/');
    
            // If it's a directory, display its name and contents
            if (info.type === "directory") {
                return (
                    <div key={cleanPath}>
                        {/* Display directory name without a link */}
                        <strong>{cleanPath}:</strong>
                        <div style={{ paddingLeft: "20px" }}>
                            {/* Render subdirectories and files as links */}
                            {info.contents && info.contents.map((fileName) => {
                                const fullPath = `${cleanPath}/${fileName}`;
                                return (
                                    <div key={fullPath}>
                                        {/* Render file or subdirectory name as a link */}
                                        <a href={`/page${fullPath}`}>{fileName}</a>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            } 
            // If it's a file, display it directly as a link
            else if (info.type === "file") {
                return (
                    <div key={cleanPath}>
                        <a href={`/page${cleanPath}`}>{cleanPath}</a>
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
            <h1>Admin Panel</h1>
            <Routes>
                <Route path="/" element={<Structure />} />
                <Route path="/create" element={<Editor />} />
            </Routes>
        </div>
    )
};

export default AdminPanel;