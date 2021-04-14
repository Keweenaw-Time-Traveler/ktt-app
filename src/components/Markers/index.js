import React, { useEffect, useRef } from 'react';
import { loadCss, loadModules } from 'esri-loader';
import styles from './Map.module.css'; // Import css modules stylesheet as styles

export const MarkersView = () => {
  const mapRef = useRef();

  useEffect(() => {
    // Map setup
    loadCss('https://js.arcgis.com/4.17/esri/themes/dark/main.css');
    // lazy load the required ArcGIS API for JavaScript modules and CSS
    loadModules(
      [
        'esri/Map',
        'esri/views/MapView',
        'esri/layers/FeatureLayer',
        'esri/Graphic',
        'esri/layers/GraphicsLayer',
      ],
      { css: true }
    ).then(([Map, MapView, FeatureLayer, Graphic, GraphicsLayer]) => {
      const layer = new FeatureLayer({
        title: 'People',
        url:
          'https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/kett_markers/FeatureServer',
        outFields: ['*'],
        popupTemplate: {
          title: '{descr}',
        },
        renderer: {
          type: 'simple',
          symbol: {
            type: 'simple-marker',
            size: 12,
            color: '#408482',
            outline: {
              color: '#ffffff',
              width: 2,
            },
          },
        },
      });

      layer.definitionExpression = "photos = 'true'";

      const map = new Map({
        basemap: 'gray-vector',
        layers: [layer],
      });

      const view = new MapView({
        container: mapRef.current,
        map: map,
        center: [-88.453743, 47.246247],
        zoom: 19,
      });
    });
  });

  return (
    <div className={styles.wrapper}>
      <div className={`webmap ${styles.map}`} ref={mapRef} />
      <div id="slider" className={styles.slider}></div>
    </div>
  );
};
