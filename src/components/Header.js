import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="header">
      <div className="header__content">
        <div className="header__control">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <Link className="header_logo" to="/">{" "}</Link>
        <nav className="header__nav">

        </nav>
      </div>
    </header>
  )
}
