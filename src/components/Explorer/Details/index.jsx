//React
import React, { useState } from 'react';
import Select from 'react-select';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  selectDetails,
  selectDetailsName,
  selectDetailsSources,
} from '../../../redux/reducers/detailsSlice';
//Styles
import './styles.scss';

const Details = (props) => {
  const details = useSelector(selectDetails);
  const name = useSelector(selectDetailsName);
  const sources = useSelector(selectDetailsSources);
  const [selectedClient, setSelectedClient] = useState('one'); //default value

  function handleSelectChange(event) {
    setSelectedClient(event.target.value);
  }

  return (
    <div className={`details-wrapper ${props.show ? 'show' : 'hide'}`}>
      <h1>{name}</h1>
      <Select options={sources} />
      <select value={selectedClient} onChange={handleSelectChange}>
        <option value="one">One</option>
        <option value="two">Two</option>
        <option value="three">Three</option>
      </select>
    </div>
  );
};

export default Details;
