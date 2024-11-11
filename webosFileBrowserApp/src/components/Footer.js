import React from 'react';

function Footer({ selectedFile }) {
  return (
    <footer className="footer">
      <p>{selectedFile ? '1 item selected' : 'No items selected'}</p>
    </footer>
  );
}

export default Footer;