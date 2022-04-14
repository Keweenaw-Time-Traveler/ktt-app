//React
import React, { useRef } from 'react';
import { NavLink } from 'react-router-dom';
//Hooks
//Src: https://letsbuildui.dev/articles/building-a-dropdown-menu-component-with-react-hooks
import { useDetectOutsideClick } from '../hooks/useDetectOutsideClick';
//Styles
import './styles.css';
//Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/pro-regular-svg-icons';
//Images
import logo from './logo_mark_only@2x.png';

export default function Menu() {
  const dropdownRef = useRef(null);
  const [isActive, setIsActive] = useDetectOutsideClick(dropdownRef, false);
  const onClick = () => setIsActive(!isActive);

  return (
    <>
      <div className="menu-logo">
        <img src={logo} alt="Logo" />
      </div>
      <div className="menu-container">
        <button onClick={onClick} className="menu-trigger">
          <span>Menu</span>
          <FontAwesomeIcon icon={faEllipsisV} className="fa-icon left" />
        </button>
        <nav
          ref={dropdownRef}
          className={`menu ${isActive ? 'active' : 'inactive'}`}
        >
          <ul>
            <li>
              <a href="https://www.keweenawhistory.com/" target="_blank">
                Home
              </a>
            </li>
            <li>
              <NavLink exact to="/">
                Explorer
              </NavLink>
            </li>
            <li>
              <a
                href="http://geospatialresearch.mtu.edu/kett/index.html?task=color"
                target="_blank"
              >
                Transcribe the Map
              </a>
            </li>
            <li>
              <a
                href="https://www.keweenawhistory.com/upcoming-events.html"
                target="_blank"
              >
                Upcoming Events
              </a>
            </li>
            <li>
              <a
                href="https://www.keweenawhistory.com/contact-us.html"
                target="_blank"
              >
                Contact Us
              </a>
            </li>
            {/* <li>
              <NavLink exact to="/login">
                Login
              </NavLink>
            </li>
            <li>
              <NavLink exact to="/signup">
                Signup
              </NavLink>
            </li> */}
          </ul>
        </nav>
      </div>
    </>
  );
}
