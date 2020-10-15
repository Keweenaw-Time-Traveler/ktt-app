import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './NavBar.module.css'; // Import css modules stylesheet as styles

export class NavBar extends Component {
  render() {
    return (
      <nav className={styles.bar}>
        <NavLink
          exact
          className={styles.link}
          activeClassName={styles.selected}
          to="/"
        >
          Home
        </NavLink>
        <NavLink
          exact
          className={styles.link}
          activeClassName={styles.selected}
          to="/login"
        >
          Login
        </NavLink>
        <NavLink
          exact
          className={styles.link}
          activeClassName={styles.selected}
          to="/signup"
        >
          Signup
        </NavLink>
      </nav>
    );
  }
}

export default NavBar;
