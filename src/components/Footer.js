import React from 'react';
import { useLocation } from 'react-router-dom'
import { useAppContext } from '../context/AppContext';

export default function Footer() {
  const [ { uid, isLoading }] = useAppContext();
  const location = useLocation();

  return (
    <footer className="footer">
      <span>{ location.pathname }</span>
      <span>{" "}</span>
      <span>
        { uid ? "AUTHENTICATED " : null}
        { isLoading ? " ⏳ " : null }
      </span>
    </footer>
  )
}
