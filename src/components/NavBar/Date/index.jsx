//React
import React from 'react';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  updateStartDate,
  updateEndDate,
  selectFiltersAll,
} from '../../../redux/reducers/filtersSlice';
import { getList } from '../../../redux/reducers/listSlice';
//Styles
import './styles.css';

export default function Search() {
  const dispatch = useDispatch();
  const filters = useSelector(selectFiltersAll);

  return (
    <div className="navbar-date">
      <select
        value={filters.startDate}
        onChange={(e) => {
          dispatch(updateStartDate(e.target.value));
          dispatch(getList({}));
        }}
        id="navbar-date-start"
        className="esri-select"
      >
        <option value="1800">1800</option>
        <option value="1888">1888</option>
        <option value="1900">1900</option>
        <option value="1908">1908</option>
        <option value="1917">1917</option>
        <option value="1928">1928</option>
        <option value="1942">1942</option>
        <option value="1949">1949</option>
      </select>
      <select
        value={filters.endDate}
        onChange={(e) => {
          dispatch(updateEndDate(e.target.value));
          dispatch(getList({}));
        }}
        id="navbar-date-end"
        className="esri-select"
      >
        <option value="">End</option>
        <option value="1888">1888</option>
        <option value="1900">1900</option>
        <option value="1908">1908</option>
        <option value="1917">1917</option>
        <option value="1928">1928</option>
        <option value="1942">1942</option>
        <option value="1949">1949</option>
        <option value="2020">2020</option>
      </select>
    </div>
  );
}
