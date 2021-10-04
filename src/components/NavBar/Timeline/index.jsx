//React
import React, { useEffect } from 'react';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import { getList } from '../../../redux/reducers/listSlice';
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
  selectActiveUrl,
  selectLeft,
  selectRight,
  selectTimelineStatus,
  updateActiveSegment,
  updateActiveUrl,
  updateLeftPip,
  updateRightPip,
} from '../../../redux/reducers/timelineSlice';
//Styles
import './styles.scss';
//Tooptip
import Tooltip from 'react-tooltip-lite';

export default function Timeline() {
  const dispatch = useDispatch();
  const timeline = useSelector(selectTimeline);
  const segments = useSelector(selectSegments);
  const segmentLength = segments.length;
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
    const url = e.target.getAttribute('data-url');
    const left = e.target.getAttribute('data-left');
    const right = e.target.getAttribute('data-right');
    const min = e.target.getAttribute('data-min');
    const max = e.target.getAttribute('data-max');
    dispatch(updateActiveSegment(id));
    dispatch(updateActiveUrl(url));
    dispatch(updateLeftPip(left));
    dispatch(updateRightPip(right));
    dispatch(updateDateRange(`${min}-${max}`));
    dispatch(updateStartDate(`${min}`));
    dispatch(updateEndDate(`${max}`));
    dispatch(getList({}));
  };

  return (
    <div id="date-range" className="navbar-timeline">
      <div className="label-min">{timeline.min}</div>
      <div className="segments">
        <div
          className="pip pip-start"
          style={{ left: `calc(${left} - 10px)` }}
        ></div>
        {segments.map((segment, index) => (
          <Tooltip
            key={index}
            className={`segment-wrapper ${
              segmentLength == index + 1 ? 'last-wrapper' : 'wrapper'
            }`}
            styles={{ width: `${segment.size}%` }}
            background="#e6a100"
            content={segment.title}
          >
            <div
              className={`segment segment-${index + 1} ${
                activeSegment == index + 1 ? 'active' : 'inactive'
              }`}
              data-id={index + 1}
              data-left={segment.left}
              data-right={segment.right}
              data-min={segment.dateMin}
              data-max={segment.dateMax}
              data-url={segment.url}
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