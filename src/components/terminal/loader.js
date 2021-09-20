import React from "react";

const Loader = ({ message }) => (
  <div className="loader">
    <div className="loader__spinner" />
    <p className="loader__text">{message}</p>
  </div>
);

export default Loader;
