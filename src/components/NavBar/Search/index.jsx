//React
import React, { useState } from 'react';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  updateSearch,
  selectFiltersAll,
} from '../../../redux/reducers/filtersSlice';
import { getList } from '../../../redux/reducers/listSlice';
//Styles
import './styles.css';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faSearch,
} from '@fortawesome/pro-solid-svg-icons';

export default function Search() {
  const dispatch = useDispatch();
  const filters = useSelector(selectFiltersAll);

  const handleSearchClick = (e) => {
    dispatch(getList({}));
  };
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
          value={filters.search}
          onChange={(e) => dispatch(updateSearch(e.target.value))}
        />
        <div className="search-input-icon" onClick={handleSearchClick}>
          <FontAwesomeIcon icon={faSearch} className="fa-icon" />
        </div>
      </div>
    </div>
  );
}
