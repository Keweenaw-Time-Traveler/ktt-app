//React
import React, { useRef } from 'react';
//Hooks
//Src: https://letsbuildui.dev/articles/building-a-dropdown-menu-component-with-react-hooks
import { useDetectOutsideClick } from '../hooks/useDetectOutsideClick';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  updateSearch,
  selectFiltersAll,
  updateDateRange,
  updateStartDate,
  updateEndDate,
  updateHide,
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
import { toggleRelated } from '../../../redux/reducers/relatedSlice';
import {
  selectHistoryActive,
  selectHistoryItems,
  clearHistoryItems,
} from '../../../redux/reducers/historySlice';
//Styles
import './styles.scss';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChevronLeft } from '@fortawesome/pro-solid-svg-icons';

export default function Search() {
  const dispatch = useDispatch();
  const filters = useSelector(selectFiltersAll);
  const timeline = useSelector(selectTimeline);
  const showList = useSelector(selectShowList);
  const historyStatus = useSelector(selectHistoryActive);
  const historyList = useSelector(selectHistoryItems);
  const historyRef = useRef(null);
  const [isActive, setIsActive] = useDetectOutsideClick(historyRef, false);

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
      dispatch(toggleRelated('hide'));
      //Reset Timeline
      // window.timePeriod = null;
      // dispatch(updateActiveSegment(null));
      // dispatch(updateLeftPip('0%'));
      // dispatch(updateRightPip('100%'));
      // dispatch(updateDateRange(`${timeline.min}-${timeline.max}`));
      // dispatch(updateTimelineRange(`${timeline.min}-${timeline.max}`));
      // dispatch(updateStartDate(`${timeline.min}`));
      // dispatch(updateEndDate(`${timeline.max}`));
      // dispatch(updateReset(false));
      // dispatch(updateHide(false));
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

  const handleBackClick = (e) => {
    e.preventDefault();
    setIsActive(!isActive);
  };

  const handleItemClick = (e) => {
    e.preventDefault();
    setIsActive(!isActive);
  };

  const handleHistoryClearClick = (e) => {
    e.preventDefault();
    dispatch(clearHistoryItems({}));
  };

  return (
    <div className="search">
      <div className="search-nav" onClick={handleBackClick}>
        <FontAwesomeIcon icon={faChevronLeft} className="fa-icon left" />
        <span>Back</span>
      </div>
      <div className="search-input">
        <input
          type="text"
          id="search"
          name="search"
          placeholder="Search People, Places, Stories"
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
      <nav
        ref={historyRef}
        className={`history ${isActive ? 'active' : 'inactive'}`}
      >
        <div className="history-heading">Viewed Records History</div>
        <div className="history-list">
          {historyStatus &&
            historyList.map((item, index) => (
              <div
                key={`item-${index}`}
                className="history-list-item"
                data-id={item.id}
                data-type={item.type}
                data-x={item.x}
                data-y={item.y}
                data-recnumber={item.recnumber}
                data-markerid={item.markerid}
                data-mapyear={item.mapyear}
                data-loctype={item.loctype}
                onClick={handleItemClick}
              >
                {item.historyname}
              </div>
            ))}
          {!historyStatus && <div className="history-empty">History Empty</div>}
        </div>
        <div className="history-footer">
          <div className="history-clear" onClick={handleHistoryClearClick}>
            Clear All
          </div>
        </div>
      </nav>
    </div>
  );
}
