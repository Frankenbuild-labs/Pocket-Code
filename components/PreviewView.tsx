import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const PreviewView: React.FC = () => {
  const { getFileContent, fileSystem } = useAppContext();
  const [srcDoc, setSrcDoc] = useState('');

  useEffect(() => {
    const buildPreview = () => {
      let htmlContent = getFileContent('index.html');
      
      if (htmlContent === null) {
        return `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Error</title>
            <style>
              body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #1a202c; color: #e2e8f0; }
              .container { text-align: center; }
              h1 { font-size: 1.5rem; }
              p { color: #a0aec0; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>File Not Found</h1>
              <p>Could not find <strong>index.html</strong> in the root of your project.</p>
            </div>
          </body>
          </html>
        `;
      }

      // Inline CSS
      htmlContent = htmlContent.replace(/<link[^>]*href="([^"]+)"[^>]*>/g, (match, path) => {
        const cssContent = getFileContent(path);
        if (cssContent !== null) {
          return `<style>${cssContent}</style>`;
        }
        return `<!-- CSS file not found: ${path} -->`;
      });

      // Inline JS
      htmlContent = htmlContent.replace(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g, (match, path) => {
        const jsContent = getFileContent(path);
        if (jsContent !== null) {
          // Add a defer to make sure DOM is loaded before script runs
          return `<script defer>${jsContent}<\/script>`;
        }
        return `<!-- JS file not found: ${path} -->`;
      });
      
      return htmlContent;
    };
    
    setSrcDoc(buildPreview());

  }, [fileSystem, getFileContent]);

  return (
    <div className="h-full w-full bg-white">
      <iframe
        srcDoc={srcDoc}
        title="preview"
        sandbox="allow-scripts allow-same-origin"
        frameBorder="0"
        width="100%"
        height="100%"
      />
    </div>
  );
};

export default PreviewView;
