import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar onMenuClick={toggleSidebar} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={closeSidebar} 
          isCollapsed={isCollapsed} 
          onToggleCollapse={toggleCollapse} 
        />
        <main 
          style={{ 
            flex: 1, 
            overflowY: "auto", 
            padding: "32px",
            backgroundColor: "var(--bg-primary)",
            position: "relative"
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
