import React from 'react';
import './styles.css';

import Search from './Search';
import Date from './Date';
import Menu from './Menu';

export default function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Search />
      </div>
      <div className="navbar-middle">
        <Date />
      </div>
      <div className="navbar-right">
        <Menu />
      </div>
    </nav>
  );
}
