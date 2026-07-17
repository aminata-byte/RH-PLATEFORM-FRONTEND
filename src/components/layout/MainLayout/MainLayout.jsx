import { useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import "./MainLayout.css";

function MainLayout({ children }) {
  const [sidebarReduit, setSidebarReduit] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className={`main-layout${sidebarReduit ? " sidebar-reduit" : ""}`}>
      <Sidebar reduit={sidebarReduit} />
      <Navbar onToggleSidebar={() => setSidebarReduit((prev) => !prev)} />
      <main className="content">
        <div className="page-transition" key={pathname}>
          {children}
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
