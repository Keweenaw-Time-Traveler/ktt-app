//React
import React from 'react';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//Styles
import './styles.css';

const RadioButton = (props) => {
  return (
    <div className="radio-button">
      <input
        id={props.id}
        className="radio-button-input"
        onChange={props.changed}
        value={props.value}
        name="filterType"
        type="radio"
        checked={props.isSelected}
      />
      <label htmlFor={props.id} className={props.value}>
        <FontAwesomeIcon icon={props.icon} className="radio-icon" />
        {props.label}
      </label>
    </div>
  );
};

export default RadioButton;
