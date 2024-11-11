import React from 'react';

function FileItem({ file, isSelected, onClick }) {
  return (
    <div
      className={`file-item ${file.isFolder ? 'folder' : 'file'} ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      onMouseEnter={() => console.log(`Hovering over ${file.name}`)}
    >
      {file.name}
    </div>
  );
}

export default FileItem;
