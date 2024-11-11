import React from 'react';
import FileItem from './FileItem';

function FileGrid({ selectedFile, setSelectedFile, currentPath, onFolderClick, fileSystem }) {
    const traversePath = (path) => {
      let currentFolder = fileSystem.root;
      path.forEach(folder => {
        currentFolder = currentFolder.folders[folder];
      });
      return currentFolder;
    };

  const currentFolder = traversePath(currentPath);

  return (
    <main className="main-content">
      <div className="section">
        <h3>Folders</h3>
        <div className="file-grid">
          {Object.keys(currentFolder.folders).map((folderName) => (
            <FileItem
              key={folderName}
              file={{ name: folderName, isFolder: true }}
              isSelected={false}
              onClick={() => onFolderClick(folderName)}
            />
          ))}
        </div>
      </div>

      <div className="section">
        <h3>Files</h3>
        <div className="file-grid">
          {currentFolder.files.map((fileName) => (
            <FileItem
              key={fileName}
              file={{ name: fileName, isFolder: false }}
              isSelected={selectedFile === fileName}
              onClick={() => setSelectedFile(fileName)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default FileGrid;
