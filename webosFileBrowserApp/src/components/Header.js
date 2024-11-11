import React from 'react';
import Breadcrumb from './Breadcrumb';

function Header({ currentPath, setCurrentPath }) {
  return (
    <header className="header">
      <Breadcrumb currentPath={currentPath} setCurrentPath={setCurrentPath} />
      <input type="text" className="search-bar" placeholder="Search..." />
      <div className="actions">
        {/* Icons or buttons for actions */}
      </div>
    </header>
  );
}

export default Header;
