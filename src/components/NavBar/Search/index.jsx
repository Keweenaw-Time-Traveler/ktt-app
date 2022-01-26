//React
import React from 'react';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  updateSearch,
  selectFiltersAll,
  updateDateRange,
  updateStartDate,
  updateEndDate,
} from '../../../redux/reducers/filtersSlice';
import {
  getList,
  updateListItem,
  toggleList,
  selectShowList,
} from '../../../redux/reducers/listSlice';
import {
  selectTimeline,
  updateTimelineRange,
  updateActiveSegment,
  updateLeftPip,
  updateRightPip,
  updateReset,
} from '../../../redux/reducers/timelineSlice';
import { toggleDetails } from '../../../redux/reducers/detailsSlice';
//Styles
import './styles.scss';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/pro-solid-svg-icons';

export default function Search() {
  const dispatch = useDispatch();
  const filters = useSelector(selectFiltersAll);
  const timeline = useSelector(selectTimeline);
  const showList = useSelector(selectShowList);

  const search = () => {
    const searchDOM = document.getElementById('search');
    const searchValue = searchDOM.value;
    //console.log('SEARCH VALUE', searchValue);
    if (searchValue !== '') {
      if (!showList) {
        dispatch(toggleList('show'));
      }
      dispatch(getList({}));
      dispatch(updateListItem({ id: '', recnumber: '' }));
      dispatch(toggleDetails('hide'));
      //Reset Timeline
      window.timePeriod = null;
      dispatch(updateActiveSegment(null));
      dispatch(updateLeftPip('0%'));
      dispatch(updateRightPip('100%'));
      dispatch(updateDateRange(`${timeline.min}-${timeline.max}`));
      dispatch(updateTimelineRange(`${timeline.min}-${timeline.max}`));
      dispatch(updateStartDate(`${timeline.min}`));
      dispatch(updateEndDate(`${timeline.max}`));
      dispatch(updateReset(false));
    } else {
      if (showList) {
        dispatch(toggleList('hide'));
      }
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
      {/* <div className="search-nav">
        <FontAwesomeIcon icon={faChevronLeft} className="fa-icon left" />
        <FontAwesomeIcon icon={faChevronRight} className="fa-icon right" />
      </div> */}
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
