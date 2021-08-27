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
  });

  const handleSelect = (e) => {
    dispatch(updateDateRange('1912-1923'));
    dispatch(updateStartDate('1912'));
    dispatch(updateEndDate('1923'));
    dispatch(getList({}));
    props.update();
  };

  return (
    <div className={`time-chooser ${showClass} ${visibleClass}`}>
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
        <option value="1912-1923">1912-1923 (Sanborn Map 1917)</option>
      </select>
    </div>
  );
}
