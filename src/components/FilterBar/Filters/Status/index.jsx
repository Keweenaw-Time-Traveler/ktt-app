//React
import React from 'react';
//Redux
import { useSelector } from 'react-redux';
import { selectStartDate } from '../../../../redux/reducers/filtersSlice';
//Styles
import './styles.scss';

export default function Status() {
  const startDate = useSelector(selectStartDate);
  return (
    <div className="status">
      <div className="status-location">Location</div>
      <div className="status-divider"></div>
      <div className="status-date">{startDate}</div>
    </div>
  );
}
