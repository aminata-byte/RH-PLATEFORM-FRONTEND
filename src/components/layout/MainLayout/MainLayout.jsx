import { useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import "./MainLayout.css";

function MainLayout({ children }) {
  const [sidebarOuvert, setSidebarOuvert] = useState(false);
  const { pathname } = useLocation();
  const [pathnamePrecedent, setPathnamePrecedent] = useState(pathname);

  if (pathname !== pathnamePrecedent) {
    setPathnamePrecedent(pathname);
    setSidebarOuvert(false);
  }

  return (
    <div className="main-layout">
      <Sidebar ouvert={sidebarOuvert} onFermer={() => setSidebarOuvert(false)} />
      <Navbar onOuvrirMenu={() => setSidebarOuvert(true)} />
      <main className="content">{children}</main>
    </div>
  );
}

export default MainLayout;
