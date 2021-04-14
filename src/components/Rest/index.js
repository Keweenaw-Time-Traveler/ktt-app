import React, { useEffect, useRef } from 'react';
import { loadCss, loadModules } from 'esri-loader';
import styles from './Map.module.css'; // Import css modules stylesheet as styles

import axios from 'axios';
import marker from './images/people.png';

export const RestView = () => {
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
        'esri/geometry/SpatialReference',
        'esri/symbols/CIMSymbol',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/renderers/SimpleRenderer',
        'esri/Color',
      ],
      { css: true }
    ).then(
      ([
        Map,
        MapView,
        FeatureLayer,
        Graphic,
        GraphicsLayer,
        SpatialReference,
        CIMSymbol,
        SimpleMarkerSymbol,
        SimpleRenderer,
        Color,
      ]) => {
        // axios
        //   .post('https://geospatialresearch.mtu.edu/markers.php', {})
        //   .then((response) => {
        //     console.log(response.data);
        //   });

        // axios
        //   .post(
        //     'https://jsonplaceholder.typicode.com/posts',
        //     {},
        //     { headers: { 'X-Requested-With': null } }
        //   )
        //   .then((response) => {
        //     console.log(response.data);
        //   });

        // fetch('https://jsonplaceholder.typicode.com/posts')
        //   .then((response) => response.json())
        //   .then((data) => console.log(data));

        axios
          .get('https://jsonplaceholder.typicode.com/posts')
          .then(function (response) {
            // handle success
            console.log(response.data);
          })
          .catch(function (error) {
            // handle error
            console.log(error);
          })
          .then(function () {
            // always executed
          });

        //Example POST method implementation:
        // async function postData(url = '', data = {}) {
        //   // Default options are marked with *
        //   const response = await fetch(url, {
        //     method: 'POST', // *GET, POST, PUT, DELETE, etc.
        //     mode: 'no-cors', // no-cors, *cors, same-origin
        //     cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //     credentials: 'same-origin', // include, *same-origin, omit
        //     headers: {
        //       'Content-Type': 'application/json',
        //       // 'Content-Type': 'application/x-www-form-urlencoded',
        //     },
        //     redirect: 'follow', // manual, *follow, error
        //     referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        //     body: JSON.stringify(data), // body data type must match "Content-Type" header
        //   });
        //   console.log(response);
        //   return response.json(); // parses JSON response into native JavaScript objects
        // }

        // postData('https://jsonplaceholder.typicode.com/posts')
        //   .then((data) => {
        //     console.log(data); // JSON data parsed by `data.json()` call
        //   })
        //   .catch((error) => {
        //     console.error('Error:', error);
        //   });

        const data = {
          active: {
            length: 6,
            people: {
              length: 6,
              results: [
                {
                  id: 'E9A74D39-1B10-4620-80BF-7C50E66BB980',
                  recnumber: '74947287CENSUS1920',
                  title: 'HELEN VIAL, MILLINER, 36, SINGLE',
                  lon: '-9860652.728',
                  lat: '5961607.5912',
                },
                {
                  id: 'E9A74D39-1B10-4620-80BF-7C50E66BB980',
                  recnumber: '74947287CENSUS1920',
                  title: 'HELEN VIAL, MILLINER, 36, SINGLE',
                  lon: '-9860652.728',
                  lat: '5961607.5912',
                },
                {
                  id: 'E9A74D39-1B10-4620-80BF-7C50E66BB980',
                  recnumber: '74947287CENSUS1920',
                  title: 'HELEN VIAL, MILLINER, 36, SINGLE',
                  lon: '-9860652.728',
                  lat: '5961607.5912',
                },
                {
                  id: 'B1BE2D0F-4B59-4AF4-B28C-FFDB04CAC0FF',
                  recnumber: '74947063CENSUS1920',
                  title: 'MAUDE BEANE, MILL CARRIER, 35, MARRIED',
                  lon: '-9860423.0177',
                  lat: '5961724.459',
                },
                {
                  id: 'B1BE2D0F-4B59-4AF4-B28C-FFDB04CAC0FF',
                  recnumber: '74947063CENSUS1920',
                  title: 'MAUDE BEANE, MILL CARRIER, 35, MARRIED',
                  lon: '-9860423.0177',
                  lat: '5961724.459',
                },
                {
                  id: 'B1BE2D0F-4B59-4AF4-B28C-FFDB04CAC0FF',
                  recnumber: '74947063CENSUS1920',
                  title: 'MAUDE BEANE, MILL CARRIER, 35, MARRIED',
                  lon: '-9860423.0177',
                  lat: '5961724.459',
                },
              ],
            },
          },
          inactive: {
            length: 0,
            people: {
              length: null,
              results: [],
            },
          },
        };

        console.log(data.active.people.results);

        const graphicsLayer = new GraphicsLayer();

        data.active.people.results.forEach((result) => {
          const svgSymbol = {
            type: 'simple-marker',
            color: [255, 255, 255, 1],
            path:
              'M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z',
            size: '20px',
            outline: {
              width: 0,
            },
          };

          const svgSymbolBg = {
            type: 'simple-marker',
            style: 'circle',
            color: [64, 132, 130, 1],
            size: '40px',
            outline: {
              color: [255, 255, 255, 1], // White
              width: 2,
            },
          };

          const sr1 = new SpatialReference({ wkid: 3857 });

          const point = {
            //Create a point
            type: 'point',
            x: result.lon,
            y: result.lat,
            spatialReference: sr1,
          };
          //console.log(point);

          const pointGraphic = new Graphic({
            geometry: point,
            symbol: svgSymbol,
          });

          const pointGraphicBg = new Graphic({
            geometry: point,
            symbol: svgSymbolBg,
          });

          graphicsLayer.addMany([pointGraphicBg, pointGraphic]);
        });

        // points to the states layer in a service storing U.S. census data
        const fl = new FeatureLayer({
          url:
            'https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/kett_markers/FeatureServer/0',
          definitionExpression: "Sci_Name = 'Ulmus pumila'",
        });

        const symbol = {
          type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
          url: marker,
          width: '30px',
          height: '30px',
        };

        fl.renderer = new SimpleRenderer({
          symbol: symbol,
        });

        const map = new Map({
          basemap: 'gray-vector',
          layers: [graphicsLayer],
        });

        const view = new MapView({
          container: mapRef.current,
          map: map,
          center: [-88.453743, 47.246247],
          zoom: 9,
        });
      }
    );
  });

  return (
    <div className={styles.wrapper}>
      <div className={`webmap ${styles.map}`} ref={mapRef} />
      <div id="slider" className={styles.slider}></div>
    </div>
  );
};
