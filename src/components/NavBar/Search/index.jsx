import React, { useState } from 'react';
import './styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faSearch,
} from '@fortawesome/pro-solid-svg-icons';

export default function Search() {
  const [search, updateSearch] = useState('mill');
  return (
    <div className="search">
      <div className="search-nav">
        <FontAwesomeIcon icon={faChevronLeft} className="fa-icon left" />
        <FontAwesomeIcon icon={faChevronRight} className="fa-icon right" />
      </div>
      <div className="search-input">
        <input
          type="text"
          id="search"
          name="search"
          placeholder="Search First Name"
          value={search}
          onChange={(e) => updateSearch(e.target.value)}
        />
        <div className="search-input-icon">
          <FontAwesomeIcon icon={faSearch} className="fa-icon" />
        </div>
      </div>
    </div>
  );
}
