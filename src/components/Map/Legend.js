import React from 'react';
import styles from './Map.module.css'; // Import css modules stylesheet as styles

export const Legend = () => {
  return (
    <div id="infoDiv" className={`esri-widget ${styles.clusterWidget}`}>
      <select id="filter" className="esri-select">
        <option value="">All</option>
        <option value="1888">1888</option>
        <option value="1900">1900</option>
        <option value="1908">1908</option>
        <option value="1917">1917</option>
        <option value="1928">1928</option>
        <option value="1942">1942</option>
        <option value="1949">1949</option>
      </select>
      <button
        id="toggle-cluster"
        className={`esri-button ${styles.clusterButton}`}
      >
        Disable Clustering
      </button>
      <div id="legendDiv" className={styles.legend}></div>
    </div>
  );
};
