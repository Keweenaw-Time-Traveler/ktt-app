//React
import React from 'react';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/pro-solid-svg-icons';
//Styles
import './styles.scss';

export default function Loader() {
  return (
    <div className="loader-markers">
      <div className="loader-markers-spinner">
        <FontAwesomeIcon icon={faCircleNotch} size="4x" spin />
      </div>
      <div className="loader-markers-message">Gathering Data</div>
    </div>
  );
}
