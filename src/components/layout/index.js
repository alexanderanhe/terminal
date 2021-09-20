import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";

// import "layout.css";

import Header from "../header";
import Footer from "../footer";

export default function Layout({ children }) {
  const [{ uid }] = useAppContext();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
      height: window.innerHeight
  });


  useEffect(() => {
    const handleResize = () => setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  return (
    <div className={`layout${!uid ? " layout--auth" : ""}`}>
      <Header auth={!uid} />
      <main className="layout__content">
        <div className="terminal-container" style={{height: `calc(${windowSize.height}px - var(--header-height))`}}>
          {children}
        </div>
      </main>
      {uid ? <Footer /> : null}
    </div>
  );
}
