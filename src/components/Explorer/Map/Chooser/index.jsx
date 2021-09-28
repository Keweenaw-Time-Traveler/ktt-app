//React
import React, { useEffect, useState } from 'react';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  updateDateRange,
  updateStartDate,
  updateEndDate,
} from '../../../../redux/reducers/filtersSlice';
import { getList } from '../../../../redux/reducers/listSlice';
import {
  selectSegments,
  updateActiveSegment,
  updateLeftPip,
  updateRightPip,
} from '../../../../redux/reducers/timelineSlice';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory } from '@fortawesome/pro-solid-svg-icons';
//Styles
import './styles.scss';

export default function Chooser(props) {
  const dispatch = useDispatch();
  //Show takes care of the opacity so fades in
  const [showClass, setShowClass] = useState('show');
  //Visible takes care of moving off screen so does not cover components below
  const [visibleClass, setVisibleClass] = useState('visible');
  //This just helps ensure element is hidden when app first loads
  const [chooserStyles, setChooserStyles] = useState({ display: 'none' });
  //Get segment list
  const segments = useSelector(selectSegments);

  useEffect(() => {
    const { show } = props;
    if (show) {
      setShowClass('show');
      setVisibleClass('visible');
    } else {
      setShowClass('hide');
      //Delay is here to allow time to fade out before moving off screen
      setTimeout(() => {
        setVisibleClass('invisible');
      }, 500);
    }
    //Display element after a little delay to let opening animation start
    setTimeout(() => {
      setChooserStyles({ display: 'flex' });
    }, 200);
  });

  const handleSelect = (e) => {
    const id = e.target.value;
    const left = e.target.options[id].getAttribute('data-left');
    const right = e.target.options[id].getAttribute('data-right');
    const min = e.target.options[id].getAttribute('data-min');
    const max = e.target.options[id].getAttribute('data-max');
    dispatch(updateActiveSegment(id));
    dispatch(updateLeftPip(left));
    dispatch(updateRightPip(right));
    dispatch(updateDateRange(`${min}-${max}`));
    dispatch(updateStartDate(`${min}`));
    dispatch(updateEndDate(`${max}`));
    dispatch(getList({}));
    props.update();
  };

  return (
    <div
      className={`time-chooser ${showClass} ${visibleClass}`}
      style={chooserStyles}
    >
      <div className="time-chooser-spinner">
        <FontAwesomeIcon icon={faHistory} size="4x" />
      </div>
      <select
        defaultValue={'DEFAULT'}
        id="time-chooser-select"
        className="time-chooser-select esri-select"
        onChange={handleSelect}
      >
        <option value="DEFAULT" disabled hidden>
          Choose a Time Period
        </option>
        {segments.map((segment, index) => (
          <option
            key={index}
            value={segment.id}
            data-left={segment.left}
            data-right={segment.right}
            data-min={segment.dateMin}
            data-max={segment.dateMax}
          >
            {segment.title}
          </option>
        ))}
      </select>
    </div>
  );
}
