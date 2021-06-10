import React, { useEffect, useRef } from 'react';
import { loadCss, loadModules } from 'esri-loader';
import styles from './Map.module.css'; // Import css modules stylesheet as styles

//Utils
import { CountPeople } from '../../util/query';

export const HeatmapView = () => {
  const mapRef = useRef();

  useEffect(() => {
    // REST api testing
    // const apiUrl =
    //   'https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_CityDir/MapServer/0';
    // axios.get(apiUrl).then((repos) => {
    //   const allRepos = repos.data;
    //   console.log(allRepos);
    // });

    // Map setup
    loadCss('https://js.arcgis.com/4.17/esri/themes/dark/main.css');
    // lazy load the required ArcGIS API for JavaScript modules and CSS
    loadModules(
      [
        'esri/Map',
        'esri/layers/FeatureLayer',
        'esri/views/MapView',
        'esri/Basemap',
        'esri/layers/VectorTileLayer',
        'esri/widgets/Legend',
        'esri/widgets/Expand',
        'esri/widgets/Slider',
        'esri/smartMapping/labels/clusters',
        'esri/smartMapping/popup/clusters',
        'esri/core/promiseUtils',
        'esri/core/watchUtils',
      ],
      { css: true }
    ).then(
      ([
        Map,
        FeatureLayer,
        MapView,
        Basemap,
        VectorTileLayer,
        Legend,
        Expand,
        Slider,
        clusterLabelCreator,
        clusterPopupCreator,
        promiseUtils,
        watchUtils,
      ]) => {
        // const stories =
        //   'https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/CCHSDI_StoryPoints_watts/FeatureServer/0';
        const people =
          'https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_CityDir/MapServer/0';

        CountPeople(''); //sending blank string will show all People

        const heatmapRenderer = {
          type: 'heatmap',
          colorStops: [
            { color: 'rgba(59, 121, 119, 0)', ratio: 0 },
            { color: 'rgba(59, 121, 119, 0.1)', ratio: 0.2 },
            { color: 'rgba(59, 121, 119, 0.2)', ratio: 0.4 },
            { color: 'rgba(59, 121, 119, 0.3)', ratio: 0.6 },
            { color: 'rgba(59, 121, 119, 0.4)', ratio: 0.8 },
            { color: 'rgba(59, 121, 119, 0.5)', ratio: 1 },
          ],
          maxPixelIntensity: 1000,
          minPixelIntensity: 0,
        };

        const layer = new FeatureLayer({
          title: 'People',
          url: people,
          outFields: ['*'],
          renderer: heatmapRenderer,
        });

        const map = new Map({
          basemap: 'gray-vector',
          layers: [layer],
        });

        const view = new MapView({
          container: mapRef.current,
          map: map,
          center: [-88.453743, 47.246247],
          zoom: 15,
        });

        view.ui.add(
          new Legend({
            view: view,
          }),
          'top-right'
        );

        //API Referance for Slider
        //https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Slider.html
        const slider = new Slider({
          container: 'sliderDiv',
          min: 0,
          max: 100,
          values: [50],
          snapOnClickEnabled: false,
          visibleElements: {
            labels: true,
            rangeLabels: true,
          },
        });
        slider.layout = 'vertical';
        slider.visibleElements = {
          labels: false,
          rangeLabels: true,
        };

        view.ui.move('zoom', 'top-right');
        view.ui.add(slider, 'top-right');

        view.when().then(function () {
          // When the view is ready, clone the heatmap renderer
          // from the only layer in the web map

          const layer = view.map.layers.getItemAt(0);
          const clusterRenderer = layer.renderer.clone();

          // The following simple renderer will render all points as simple
          // markers at certain scales

          const simpleRenderer = {
            type: 'simple',
            symbol: {
              type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
              // Arrow marker
              path: 'M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z',
              color: '#3b7977',
              outline: {
                color: '#ffffff',
                width: 2,
              },
              size: 15,
            },
          };

          // When the scale is larger than 1:72,224 (zoomed in passed that scale),
          // then switch from a heatmap renderer to a simple renderer. When zoomed
          // out beyond that scale, switch back to the heatmap renderer

          view.watch('scale', function (newValue) {
            layer.renderer =
              newValue <= 1200 ? simpleRenderer : clusterRenderer;
          });

          view.whenLayerView(layer).then(function (layerView) {
            const filterSelect = document.getElementById('filter');
            const searchSelect = document.getElementById('search');
            let filterValue = '';
            let searchValue = '';
            searchSelect.addEventListener('keyup', function (event) {
              if (event.key === 'Enter') {
                searchValue = event.target.value;
                const addFilter = filterValue ? ` AND year = filterValue` : '';
                const whereClause = searchValue
                  ? `firstname = '${searchValue}'${addFilter}`
                  : null;
                //layerView.definitionExpression = whereClause;
                layerView.filter = {
                  where: whereClause,
                };
                CountPeople(whereClause);
                // close popup for former cluster that no longer displays
                view.popup.close();
              }
            });
            // filters the layer using a definitionExpression
            // based on a year selected by the user
            filterSelect.addEventListener('change', function (event) {
              filterValue = event.target.value;
              const addSearch = searchValue
                ? ` AND firstname = '${searchValue}'`
                : '';
              const whereClause = filterValue
                ? `year = ${filterValue}${addSearch}`
                : null;
              //layerView.definitionExpression = whereClause;
              layerView.filter = {
                where: whereClause,
              };
              CountPeople(whereClause);
              // close popup for former cluster that no longer displays
              view.popup.close();
            });
          });
        });

        // Displays instructions to the user for understanding the sample
        // And places them in an Expand widget instance

        const sampleInstructions = document.createElement('div');
        sampleInstructions.style.padding = '10px';
        sampleInstructions.style.backgroundColor = 'white';
        sampleInstructions.style.width = '300px';
        sampleInstructions.innerText = [
          'As you zoom in, the style will switch from a',
          'heatmap to individual points.',
        ].join(' ');

        const instructionsExpand = new Expand({
          expandIconClass: 'esri-icon-question',
          expandTooltip: 'How to use this sample',
          expanded: true,
          view: view,
          content: sampleInstructions,
        });
        view.ui.add(instructionsExpand, 'top-right');

        // Hide the instructions when the user starts interacting with the sample

        watchUtils.whenTrueOnce(view, 'interacting', function () {
          instructionsExpand.expanded = false;
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
