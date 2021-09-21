import React from 'react';
import { useAppContext } from '../../context/AppContext';

export default function Footer() {
  const [ {isLoading }] = useAppContext();
  return (
    <footer className="footer">
      <span className="footer_notification">
        AUTHENTICATED
        { isLoading ? " ⏳ " : null }
      </span>
    </footer>
  )
}
