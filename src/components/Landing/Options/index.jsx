//React
import React, { useState, useEffect } from 'react';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  updateLandingView,
  turnOnToolTips,
} from '../../../redux/reducers/landingSlice';
import {
  selectFiltersAll,
  updateSearch,
} from '../../../redux/reducers/filtersSlice';
import { updateMapView } from '../../../redux/reducers/mapSlice';
import { toggleList } from '../../../redux/reducers/listSlice';
//Components
import Help from '../../Explorer/Map/Help';
//Styles
import './styles.scss';
//Images
import miniMap from '../images/mini_map.jpg';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/pro-solid-svg-icons';
//Utilities
import { getUrlVariable } from '../../../util/getUrlVariable';

export default function Search(props) {
  const dispatch = useDispatch();
  const filters = useSelector(selectFiltersAll);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    //Check if there is a param in the url and skip to map if there is
    const searchParam = getUrlVariable('title');
    if (searchParam) return search(true);
    //This will fade in Map using CSS
    setTimeout(() => {
      setShowMap(true);
    }, 1000);
  }, []);

  const search = (hideList) => {
    dispatch(updateLandingView({ show: false, remove: true }));
    dispatch(updateMapView(true));
    dispatch(turnOnToolTips(false));
    if (!hideList) {
      dispatch(toggleList('show'));
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

  const handleExploreClick = (e) => {
    dispatch(updateLandingView({ show: false, remove: true }));
    dispatch(toggleList('hide'));
    dispatch(updateMapView(true));
  };

  return (
    <div className={`intro-options ${props.show ? 'show' : 'hide'}`}>
      <div className="intro-options-main">
        <div className="intro-options-search">
          <div className="intro-options-search-input">
            <input
              type="text"
              id="search-landing"
              name="search"
              placeholder="Search People, Places and Stories"
              value={filters.search}
              onKeyDown={handleKeyDown}
              onChange={(e) => dispatch(updateSearch(e.target.value))}
            />
            <div
              id="intro-options-search-icon"
              className="intro-options-search-icon"
              onClick={handleSearchClick}
            >
              <FontAwesomeIcon icon={faSearch} className="fa-icon" />
            </div>
          </div>
        </div>
        <div
          className="intro-options-button intro-options-explore"
          onClick={handleExploreClick}
        >
          <button>
            Explore
            <br />
            the map
          </button>
        </div>
      </div>

      <div className={`intro-options-mini-map ${showMap ? 'show' : 'hide'}`}>
        <img src={miniMap} alt="Map key" />
      </div>
      <Help />
    </div>
  );
}
