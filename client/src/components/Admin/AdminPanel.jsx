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
            if (info.type === "directory") {
                return (
                    <div key={path}>
                        <strong>{path}</strong>
                        {/* Render the contents of this directory */}
                        <div style={{ paddingLeft: "20px" }}>
                            {renderStructure(struct)} {/* Call recursively */}
                        </div>
                    </div>
                );
            } else if (info.type === "file") {
                return (
                    <div key={path}>
                        <a /* `/page${path}` */>{path.replace("/", "")}</a>
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
                {structure == true ? renderStructure(structure) : <h3>Empty</h3>}
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