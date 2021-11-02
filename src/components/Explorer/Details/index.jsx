//React
import React from 'react';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  selectDetails,
  selectDetailsName,
} from '../../../redux/reducers/detailsSlice';
//Styles
import './styles.scss';

const Details = (props) => {
  const details = useSelector(selectDetails);
  const name = useSelector(selectDetailsName);
  return (
    <div className={`details-wrapper ${props.show ? 'show' : 'hide'}`}>
      <h1>{name}</h1>
    </div>
  );
};

export default Details;
