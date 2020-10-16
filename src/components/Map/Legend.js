import React from 'react';
import styles from './Map.module.css'; // Import css modules stylesheet as styles

export const Legend = () => {
  return (
    <div id="infoDiv" className={`esri-widget ${styles.clusterWidget}`}>
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
