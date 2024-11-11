import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import FileGrid from "./components/FileGrid";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentPath, setCurrentPath] = useState([]); // Array representing folder path
  const [fileSystem, setFileSystem] = useState({
    root: {
      folders: {},
      files: [],
    },
  });

  const handleFolderClick = (folderName) => {
    setCurrentPath([...currentPath, folderName]);
  };

  const handleSidebarItemClick = (itemName) => {
    switch (itemName) {
      case "My Files":
        setCurrentPath([]); // Go to the root directory
        break;
      case "New Folder":
        createNewFolder();
        break;
      case "New File":
        createNewFile();
        break;
      case "Settings":
        console.log("Open settings"); // Placeholder for settings action
        break;
      case "Logout":
        console.log("Logout action"); // Placeholder for logout action
        break;
      default:
        break;
    }
  };

  const createNewFolder = () => {
    // eslint-disable-next-line no-undef
    const folderName = prompt("Enter new folder name:");
    if (!folderName) return;

    setFileSystem((prevFileSystem) => {
      const newFileSystem = { ...prevFileSystem };
      let currentFolder = newFileSystem.root;

      // Traverse the current path to reach the targeted folder
      currentPath.forEach((folder) => {
        currentFolder = currentFolder.folders[folder];
      });

      // Check if the folder already exists
      if (currentFolder.folders[folderName]) {
        //alert("Folder already exists!");
        return prevFileSystem; // Return previous state without modifications
      } else {
        // Create the new folder if it doesn't exist
        currentFolder.folders[folderName] = { folders: {}, files: [] };
        return newFileSystem; // Return the updated state
      }
    });
  };

  const createNewFile = () => {
    // eslint-disable-next-line no-undef
    const fileName = prompt("Enter new file name:");
    if (!fileName) return;

    setFileSystem((prevFileSystem) => {
      const newFileSystem = { ...prevFileSystem };
      let currentFolder = newFileSystem.root;

      // Traverse the current path to reach the targeted folder
      currentPath.forEach((folder) => {
        currentFolder = currentFolder.folders[folder];
      });

      // Check if the file already exists
      if (currentFolder.files.includes(fileName)) {
        //alert("File already exists!");
        return prevFileSystem; // Return previous state without modifications
      } else {
        // Add the new file if it doesn't exist
        currentFolder.files.push(fileName);
        return newFileSystem; // Return the updated state
      }
    });
  };

  return (
    <div className="file-browser">
      <Header currentPath={currentPath} setCurrentPath={setCurrentPath} />
      <Sidebar onSidebarItemClick={handleSidebarItemClick} />
      <FileGrid
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        currentPath={currentPath}
        onFolderClick={handleFolderClick}
        fileSystem={fileSystem}
      />
      <Footer selectedFile={selectedFile} />
    </div>
  );
}

export default App;
