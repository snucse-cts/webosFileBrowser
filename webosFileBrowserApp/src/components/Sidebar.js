function Sidebar({ onSidebarItemClick }) {
    return (
      <aside className="sidebar">
        <ul>
          {["My Files", "New Folder", "New File", "Settings", "Logout"].map((item) => (
            <li key={item} onClick={() => onSidebarItemClick(item)}>
              {item}
            </li>
          ))}
        </ul>
      </aside>
    );
  }

  export default Sidebar;
