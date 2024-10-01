import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

const URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

function Page() {
  const [pageContent, setPageContent] = useState('Loading...');
  const location = useLocation(); // To get the current path

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        // Extracting the dynamic part of the path after "/page/"
        const pagePath = location.pathname.replace('/page/', '');
        
        const path = pagePath == "/" ? "index" : pagePath;

        // Make a GET request to your backend with the pagePath
        const response = await axios.get(`${URL}/page-get`, {
          params: { pagePath: path }
        });

        // Set the response data (HTML) to state
        setPageContent(response.data);
      } catch (error) {
        console.error('Error fetching page content:', error);
        setPageContent('<p>Failed to load page content.</p>');
      }
    };

    fetchPageContent();
  }, [location]);

  return (
    <div dangerouslySetInnerHTML={{ __html: pageContent }} />
  );
}

export default Page;