//React
import React from 'react';
//Redux
import { useSelector } from 'react-redux';
import { selectAllList } from '../../../redux/reducers/listSlice';
//Styles
import './styles.css';

export default function Results() {
  const list = useSelector(selectAllList);
  return (
    <div className="results">
      Results <span>({list.active.length})</span>
    </div>
  );
}
