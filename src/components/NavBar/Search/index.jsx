//React
import React from 'react';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  updateSearch,
  selectFiltersAll,
} from '../../../redux/reducers/filtersSlice';
import {
  getList,
  updateListItem,
  toggleList,
} from '../../../redux/reducers/listSlice';
import { toggleDetails } from '../../../redux/reducers/detailsSlice';
//Styles
import './styles.scss';
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

  const search = () => {
    const searchDOM = document.getElementById('search');
    const searchValue = searchDOM.value;
    //console.log('SEARCH VALUE', searchValue);
    if (searchValue !== '') {
      dispatch(getList({}));
      dispatch(toggleList('show'));
      dispatch(updateListItem({ id: '', recnumber: '' }));
      dispatch(toggleDetails('hide'));
    } else {
      dispatch(toggleList('hide'));
    }
  };

  const handleSearchClick = (e) => {
    e.preventDefault();
    search();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      search();
    }
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
          onKeyDown={handleKeyDown}
          onChange={(e) => dispatch(updateSearch(e.target.value))}
        />
        <div
          className="search-input-icon"
          id="search-icon"
          onClick={handleSearchClick}
        >
          <FontAwesomeIcon icon={faSearch} className="fa-icon" />
        </div>
      </div>
    </div>
  );
}
