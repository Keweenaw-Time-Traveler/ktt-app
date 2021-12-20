//React
import React, { useEffect } from 'react';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import { selectRemoveList, getList } from '../../../redux/reducers/listSlice';
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
  selectReset,
  updateTimelineRange,
  updateActiveSegment,
  updateLeftPip,
  updateRightPip,
  updateReset,
} from '../../../redux/reducers/timelineSlice';
//Styles
import './styles.scss';
//Tooptip
import Tooltip from 'react-tooltip-lite';

export default function Timeline() {
  const dispatch = useDispatch();
  const listRemove = useSelector(selectRemoveList);
  const timeline = useSelector(selectTimeline);
  const segments = useSelector(selectSegments);
  const segmentLength = segments.length;
  const activeSegment = useSelector(selectActiveSegment);
  const left = useSelector(selectLeft);
  const right = useSelector(selectRight);
  const timelineStatus = useSelector(selectTimelineStatus);
  const resetStatus = useSelector(selectReset);

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
    dispatch(updateReset(true));
    if (!listRemove) {
      dispatch(getList({}));
    }
  };
  const handleResetClick = (e) => {
    window.timePeriod = null;
    dispatch(updateActiveSegment(null));
    dispatch(updateLeftPip('0%'));
    dispatch(updateRightPip('100%'));
    dispatch(updateDateRange(`${timeline.min}-${timeline.max}`));
    dispatch(updateTimelineRange(`${timeline.min}-${timeline.max}`));
    dispatch(updateStartDate(`${timeline.min}`));
    dispatch(updateEndDate(`${timeline.max}`));
    dispatch(updateReset(false));
    if (!listRemove) {
      dispatch(getList({}));
    }
  };
  return (
    <>
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
              className={`segment-wrapper wrapper${
                !index ? ' first-wrapper' : ''
              }${segmentLength === index + 1 ? ' last-wrapper' : ''}`}
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
      {resetStatus && (
        <div className="timeline-reset" onClick={handleResetClick}>
          Reset
        </div>
      )}
    </>
  );
}
