import React from 'react';
import { useAppContext } from '../context/AppContext';

export default function Footer() {
  const [ { uid, isLoading }] = useAppContext();
  return (
    <footer className="footer">
      <span className="footer_notification">
        { uid ? "AUTHENTICATED" : null}
        { isLoading ? " ⏳ " : null }
      </span>
    </footer>
  )
}
