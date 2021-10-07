//React
import React from 'react';
//Redux
import { useSelector } from 'react-redux';
import { selectFiltersAll } from '../../../../redux/reducers/filtersSlice';
import { selectTimelineRange } from '../../../../redux/reducers/timelineSlice';
//Styles
import './styles.scss';

export default function Status() {
  const filters = useSelector(selectFiltersAll);
  const timelineRange = useSelector(selectTimelineRange);
  return (
    <div className="status">
      <div className="status-location">{filters.placeName}</div>
      <div className="status-divider"></div>
      <div className="status-date">{timelineRange}</div>
    </div>
  );
}
