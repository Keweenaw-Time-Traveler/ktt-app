//React
import React from 'react';
import Select from 'react-select';
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
  const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' },
  ];
  return (
    <div className={`details-wrapper ${props.show ? 'show' : 'hide'}`}>
      <h1>{name}</h1>
      <Select options={options} />
    </div>
  );
};

export default Details;
