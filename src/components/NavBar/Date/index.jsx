//React
import React from 'react';
//Redux
import { useSelector } from 'react-redux';
import { selectFiltersAll } from '../../../redux/reducers/filtersSlice';
//Styles
import './styles.css';

export default function Search() {
  const filters = useSelector(selectFiltersAll);

  return (
    <div id="date-range" className="navbar-date">
      {`${filters.startDate}-${filters.endDate}`}
    </div>
  );
}
