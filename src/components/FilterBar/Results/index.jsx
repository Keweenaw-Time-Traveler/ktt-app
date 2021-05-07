//React
import React from 'react';
//Redux
import { useSelector } from 'react-redux';
import { selectLength } from '../../../redux/reducers/markersSlice';
//Styles
import './styles.css';

export default function Results() {
  const results = useSelector(selectLength);
  return (
    <div className="results">
      Results <span>({results})</span>
    </div>
  );
}
