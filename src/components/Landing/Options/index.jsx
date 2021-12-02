//React
import React, { useState, useEffect } from 'react';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  updateLandingView,
  selectShowToolTips,
  turnOnToolTips,
  updateLandingSearch,
  selectLandingSearch,
} from '../../../redux/reducers/landingSlice';
import {
  selectFiltersAll,
  updateSearch,
} from '../../../redux/reducers/filtersSlice';
import { updateMapView } from '../../../redux/reducers/mapSlice';
import { toggleList } from '../../../redux/reducers/listSlice';
//Styles
import './styles.scss';
//Images
import miniMap from '../images/mini_map.jpg';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faQuestion } from '@fortawesome/pro-solid-svg-icons';
//Tooptip
import Tooltip from 'react-tooltip-lite';

export default function Search(props) {
  const dispatch = useDispatch();
  const showToolTips = useSelector(selectShowToolTips);
  const filters = useSelector(selectFiltersAll);
  const [showMap, setShowMap] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    //This will fade in Map using CSS
    setTimeout(() => {
      setShowMap(true);
      setTimeout(() => setShowHelp(true), 1000);
    }, 1000);
  }, []);

  const search = () => {
    dispatch(updateLandingView({ show: false, remove: true }));
    dispatch(toggleList('show'));
    dispatch(updateMapView(true));
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

  const handleHelpClick = (e) => {
    const toggle = showToolTips ? false : true;
    dispatch(turnOnToolTips(toggle));
  };

  return (
    <div className={`intro-options ${props.show ? 'show' : 'hide'}`}>
      <div className="intro-options-main">
        <Tooltip
          content="Know what you are looking for? Search for it here!"
          isOpen={showToolTips}
        >
          <div className="intro-options-search">
            <div className="intro-options-search-input">
              <input
                type="text"
                id="search-landing"
                name="search"
                placeholder="Start your search here!"
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
        </Tooltip>
        <Tooltip
          content="Don't feel like searching? Exploring the map sounds like the option for you!"
          direction="down"
          isOpen={showToolTips}
        >
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
        </Tooltip>
        <Tooltip
          content="Featured stories is a great way to get started!"
          isOpen={showToolTips}
        >
          <div className="intro-options-button intro-options-stories">
            <button>Featured stories</button>
          </div>
        </Tooltip>
      </div>

      <div className={`intro-options-mini-map ${showMap ? 'show' : 'hide'}`}>
        <Tooltip
          content="The Keweenaw is located in the Upper Peninsula of Michigan"
          distance={30}
          isOpen={showToolTips}
        >
          <img src={miniMap} />
        </Tooltip>
      </div>

      <div
        className={`intro-options-help ${showHelp ? 'show' : 'hide'}`}
        onClick={handleHelpClick}
      >
        <FontAwesomeIcon icon={faQuestion} className="fa-icon" />
        <span>
          I need
          <br />
          help
        </span>
      </div>
    </div>
  );
}
