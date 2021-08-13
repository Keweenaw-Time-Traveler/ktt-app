import React from 'react';
import './styles.scss';

import Search from './Search';
import Date from './Date';
import Menu from './Menu';

export default function NavBar(props) {
  return (
    <nav className={`navbar ${props.show ? 'show' : 'hide'}`}>
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
