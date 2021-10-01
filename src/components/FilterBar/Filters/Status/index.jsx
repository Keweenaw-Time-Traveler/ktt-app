//React
import React from 'react';
//Redux
import { useSelector } from 'react-redux';
import { selectFiltersAll } from '../../../../redux/reducers/filtersSlice';
//Styles
import './styles.scss';

export default function Status() {
  const filters = useSelector(selectFiltersAll);
  return (
    <div className="status">
      <div className="status-location">{filters.location}</div>
      <div className="status-divider"></div>
      <div className="status-date">{filters.dateRange}</div>
    </div>
  );
}
