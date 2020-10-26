import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './NavBar.module.css'; // Import css modules stylesheet as styles

export class NavBar extends Component {
  render() {
    return (
      <nav className={styles.bar}>
        <div className={styles.total}>
          <div className={styles.search}>
            <input
              type="text"
              id="search"
              name="search"
              placeholder="Search First Name"
              className={styles.input}
            />
          </div>
          <div className={styles.filter}>
            <select id="filter" className="esri-select">
              <option value="">All</option>
              <option value="1888">1888</option>
              <option value="1900">1900</option>
              <option value="1908">1908</option>
              <option value="1917">1917</option>
              <option value="1928">1928</option>
              <option value="1942">1942</option>
              <option value="1949">1949</option>
            </select>
          </div>
          <div className={styles.stats}>
            People: <span id="total-people">loading...</span>
          </div>
        </div>
        <NavLink
          exact
          className={styles.link}
          activeClassName={styles.selected}
          to="/"
        >
          Cluster
        </NavLink>
        <NavLink
          exact
          className={styles.link}
          activeClassName={styles.selected}
          to="/heatmap"
        >
          Heatmap
        </NavLink>
        <NavLink
          exact
          className={styles.link}
          activeClassName={styles.selected}
          to="/wurman"
        >
          Wurman
        </NavLink>
        {/* <NavLink
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
        </NavLink> */}
      </nav>
    );
  }
}

export default NavBar;
