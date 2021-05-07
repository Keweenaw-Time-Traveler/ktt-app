//React
import React from 'react';
//Components
import Results from './Results';
import Filters from './Filters';
//Styles
import styles from './styles.css';

export default function FilterBar() {
  return (
    <div className="filter-bar">
      <Results />
      <Filters />
    </div>
  );
}
