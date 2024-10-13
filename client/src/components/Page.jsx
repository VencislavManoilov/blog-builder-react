import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

const URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

const MenuSections = () => {
  const [structure, setStruct] = useState(false)

  useEffect(() => {
    const getStruct = async () => {
      try {
        const schema = await axios.get(`${URL}/structure`);
        setStruct(schema.data);
      } catch(err) {
        console.log("Error:", err);
      }
    }

    getStruct();
  }, [])

  return (
    <>
      <button onClick={() => { document.location.href = "/" }}>Home</button>
      {Object.keys(structure).map((dir) => (
        structure[dir].type === 'directory' ? structure[dir].contents && (
          <select
            key={dir} // Ensures each <select> element has a unique key
            onChange={(e) => { window.location.href = e.target.value; }}
          >
            <option value="">{dir.slice(1)}</option>
            {structure[dir].contents.map((page, index) => (
              <option key={`${dir}-${page}-${index}`} value={`/page${dir}/${page}`}>
                {page}
              </option>
            ))}
          </select>
        ) :
        structure[dir].type === 'file' && dir !== "\\index" && (
          <button key={dir} onClick={() => { document.location.href = `/page${dir}` }}>
            {dir.slice(1)}
          </button>
        )
      ))}
    </>
  )
}

function Page() {
  const [pageContent, setPageContent] = useState('Loading...');
  const [title, setTitle] = useState("Blog");
  const location = useLocation(); // To get the current path

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        // Extracting the dynamic part of the path after "/page/"
        const pagePath = location.pathname.replace('/page/', '');
        
        const path = pagePath == "/" ? "index" : pagePath;

        // Make a GET request to your backend with the pagePath
        const content = await axios.get(`${URL}/page-get`, {
          params: { pagePath: path }
        });

        // Set the response data (HTML) to state
        setPageContent(content.data.content);
        setTitle(content.data.title);
      } catch (error) {
        console.error('Error fetching page content:', error);
        setPageContent('<p>Failed to load page content.</p>');
      }
    };

    fetchPageContent();
  }, [location]);

  return (
    <div>
      <MenuSections />

      <h1>{title}</h1>

      <div dangerouslySetInnerHTML={{ __html: pageContent }} />
    </div>
  );
}

export default Page;