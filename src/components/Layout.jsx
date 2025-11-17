import React from 'react';
import './Layout.css';

export default function Layout({ children, onLogout, user }) {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">Indorama Canteen</h1>
          <nav className="nav">
            <span className="user-info">Welcome, {user?.email}</span>
            <button className="btn-logout" onClick={onLogout}>
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
