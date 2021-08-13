//React
import React from 'react';
//Components
import Results from './Results';
import Filters from './Filters';
//Styles
import './styles.scss';

export default function FilterBar(props) {
  return (
    <div className={`filter-bar ${props.show ? 'show' : 'hide'}`}>
      <Results />
      <Filters />
    </div>
  );
}
