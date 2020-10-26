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
      <select
        name="map-background"
        id="map-background"
        className={styles.dropdown}
        defaultValue="starter"
      >
        <option value="starter">Modern Satallite</option>
        <option value="professional">Historic Topo</option>
      </select>
      <div id="legendDiv" className={styles.legend}></div>
    </div>
  );
};
