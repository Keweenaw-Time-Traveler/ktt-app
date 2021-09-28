//React
import React, { useEffect } from 'react';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  updateDateRange,
  updateStartDate,
  updateEndDate,
} from '../../../redux/reducers/filtersSlice';
import {
  getTimeline,
  selectTimeline,
  selectSegments,
  selectActiveSegment,
  selectLeft,
  selectRight,
  selectTimelineStatus,
  updateActiveSegment,
  updateLeftPip,
  updateRightPip,
} from '../../../redux/reducers/timelineSlice';
//Styles
import './styles.scss';
//Tooptip
import Tooltip from 'react-tooltip-lite';

export default function Search() {
  const dispatch = useDispatch();
  const timeline = useSelector(selectTimeline);
  const segments = useSelector(selectSegments);
  const activeSegment = useSelector(selectActiveSegment);
  const left = useSelector(selectLeft);
  const right = useSelector(selectRight);
  const timelineStatus = useSelector(selectTimelineStatus);

  useEffect(() => {
    if (timelineStatus === 'idle') {
      dispatch(getTimeline({}));
    }
  }, [timelineStatus, dispatch]);

  const handleSegmentClick = (e) => {
    const id = e.target.getAttribute('data-id');
    const left = e.target.getAttribute('data-left');
    const right = e.target.getAttribute('data-right');
    const min = e.target.getAttribute('data-min');
    const max = e.target.getAttribute('data-max');
    dispatch(updateActiveSegment(id));
    dispatch(updateLeftPip(left));
    dispatch(updateRightPip(right));
    dispatch(updateDateRange(`${min}-${max}`));
    dispatch(updateStartDate(`${min}`));
    dispatch(updateEndDate(`${max}`));
  };

  return (
    <div id="date-range" className="navbar-date">
      <div className="label-min">{timeline.min}</div>
      <div className="segments">
        <div
          className="pip pip-start"
          style={{ left: `calc(${left} - 10px)` }}
        ></div>
        {segments.map((segment, index) => (
          <Tooltip
            key={index}
            className="segment-wrapper"
            styles={{ width: `${segment.size}%` }}
            background="#e6a100"
            content={segment.title}
          >
            <div
              className={`segment segment-${index + 1} ${
                activeSegment == index + 1 ? 'active' : null
              }`}
              data-id={index + 1}
              data-left={segment.left}
              data-right={segment.right}
              data-min={segment.dateMin}
              data-max={segment.dateMax}
              onClick={handleSegmentClick}
            ></div>
          </Tooltip>
        ))}
        <div
          className="pip pip-end"
          style={{ left: `calc(${right} - 10px)` }}
        ></div>
      </div>
      <div className="label-max">{timeline.max}</div>
    </div>
  );
}
