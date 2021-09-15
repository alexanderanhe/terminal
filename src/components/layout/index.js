import React from "react";
import { useAppContext } from "../../context/AppContext";

// import "layout.css";

import Header from "../header";
import Footer from "../footer";

export default function Layout({ children }) {
  const [{ uid }] = useAppContext();
  return (
    <div className={`layout${!uid ? " layout--auth" : ""}`}>
      <Header auth={!uid} />
      <main className="layout__content">
        {children}
      </main>
      {uid ? <Footer /> : null}
    </div>
  );
}
