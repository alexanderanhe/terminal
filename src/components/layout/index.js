import React from "react";
import { useAppContext } from "../../context/AppContext";

// import "layout.css";

import Header from "../header";
import Sidebar from "../sidebar";

export default function Layout({ children }) {
  const [{ uid }] = useAppContext();
  return (
    <div className={`layout${!uid ? " layout--auth" : ""}`}>
      <Header auth={!uid} />
      {uid ? <Sidebar /> : null}
      <main className="layout__content">
        {children}
      </main>
    </div>
  );
}
