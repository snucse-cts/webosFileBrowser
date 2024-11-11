import React from 'react';

function Breadcrumb({ currentPath, setCurrentPath }) {
  const handleBreadcrumbClick = (index) => {
    // Set the path to the clicked breadcrumb level
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  return (
    <div className="breadcrumb">
      <span className="breadcrumb-item" onClick={() => setCurrentPath([])}>
        Home
      </span>
      {currentPath.map((folder, index) => (
        <React.Fragment key={index}>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item" onClick={() => handleBreadcrumbClick(index)}>
            {folder}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

export default Breadcrumb;
