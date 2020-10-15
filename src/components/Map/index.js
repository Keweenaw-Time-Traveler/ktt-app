import React, { useEffect, useRef } from 'react';
import { loadCss, loadModules } from 'esri-loader';
import axios from 'axios';
import styles from './Map.module.css'; // Import css modules stylesheet as styles

//Components
import { Legend } from './Legend';

export const WebMapView = () => {
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
    loadCss('https://js.arcgis.com/4.17/esri/themes/dark-blue/main.css');
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
        'esri/smartMapping/labels/clusters',
        'esri/smartMapping/popup/clusters',
        'esri/core/promiseUtils',
        'esri/tasks/QueryTask',
        'esri/tasks/support/Query',
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
        clusterLabelCreator,
        clusterPopupCreator,
        promiseUtils,
        QueryTask,
        Query,
      ]) => {
        const stories =
          'https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/CCHSDI_StoryPoints_watts/FeatureServer/0';
        const people =
          'https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_CityDir/MapServer/0';

        const queryTask = new QueryTask({
          url: people,
        });
        const query = new Query();
        query.returnGeometry = true;
        query.outFields = ['*'];
        query.where = '1 = 1'; // Return all cities with a population greater than 1 million

        // When resolved, returns features and graphics that satisfy the query.
        queryTask.execute(query).then(function (results) {
          console.log(results.features);
        });

        // When resolved, returns a count of the features that satisfy the query.
        queryTask.executeForCount(query).then(function (results) {
          console.log(results);
        });

        const layer = new FeatureLayer({
          title: 'People',
          url: people,
          outFields: ['*'],
          popupTemplate: {
            title: '{firstname} {lastname}',
            content: [
              {
                type: 'fields',
                fieldInfos: [
                  {
                    fieldName: 'year',
                  },
                  {
                    fieldName: 'occupation',
                  },
                  {
                    fieldName: 'street_nam',
                  },
                ],
              },
            ],
          },
          renderer: {
            type: 'simple',
            symbol: {
              type: 'simple-marker',
              size: 4,
              color: '#69dcff',
              outline: {
                color: 'rgba(0, 139, 174, 0.5)',
                width: 5,
              },
            },
          },
        });

        var basemap = new Basemap({
          baseLayers: [
            new VectorTileLayer({
              portalItem: {
                id: 'c11ce4f7801740b2905eb03ddc963ac8', // Dark Gray Canvas
              },
            }),
          ],
        });

        const map = new Map({
          basemap: basemap,
          layers: [layer],
        });

        //load the map view at the ref's DOM node
        const view = new MapView({
          container: mapRef.current,
          map: map,
          center: [-88.453743, 47.246247],
          zoom: 15,
        });

        const legend = new Legend({
          view: view,
          container: 'legendDiv',
        });

        const infoDiv = document.getElementById('infoDiv');
        view.ui.add(
          new Expand({
            view: view,
            content: infoDiv,
            expandIconClass: 'esri-icon-layer-list',
            expanded: false,
          }),
          'top-left'
        );

        layer
          .when()
          .then(generateClusterConfig)
          .then(function (featureReduction) {
            layer.featureReduction = featureReduction;

            const toggleButton = document.getElementById('toggle-cluster');
            toggleButton.addEventListener('click', toggleClustering);

            // To turn off clustering on a layer, set the
            // featureReduction property to null
            function toggleClustering() {
              if (isWithinScaleThreshold()) {
                let fr = layer.featureReduction;
                layer.featureReduction =
                  fr && fr.type === 'cluster' ? null : featureReduction;
              }
              toggleButton.innerText =
                toggleButton.innerText === 'Enable Clustering'
                  ? 'Disable Clustering'
                  : 'Enable Clustering';
            }

            view.whenLayerView(layer).then(function (layerView) {
              const filterSelect = document.getElementById('filter');
              // filters the layer using a definitionExpression
              // based on a year selected by the user
              filterSelect.addEventListener('change', function (event) {
                const newValue = event.target.value;

                const whereClause = newValue ? 'year = ' + newValue : null;
                //layerView.definitionExpression = whereClause;
                layerView.filter = {
                  where: whereClause,
                };
                // close popup for former cluster that no longer displays
                view.popup.close();
              });
            });

            view.watch('scale', function (scale) {
              if (toggleButton.innerText === 'Disable Clustering') {
                layer.featureReduction = isWithinScaleThreshold()
                  ? featureReduction
                  : null;
              }
            });
          })
          .catch(function (error) {
            console.error(error);
          });

        function isWithinScaleThreshold() {
          return view.scale > 4000;
        }

        function generateClusterConfig(layer) {
          // generates default popupTemplate
          const popupPromise = clusterPopupCreator
            .getTemplates({
              layer: layer,
            })
            .then(function (popupTemplateResponse) {
              return popupTemplateResponse.primaryTemplate.value;
            });

          // generates default labelingInfo
          const labelPromise = clusterLabelCreator
            .getLabelSchemes({
              layer: layer,
              view: view,
            })
            .then(function (labelSchemes) {
              return labelSchemes.primaryScheme;
            });

          return promiseUtils
            .eachAlways([popupPromise, labelPromise])
            .then(function (result) {
              const popupTemplate = result[0].value;

              const primaryLabelScheme = result[1].value;
              const labelingInfo = primaryLabelScheme.labelingInfo;
              // Ensures the clusters are large enough to fit labels
              const clusterMinSize = primaryLabelScheme.clusterMinSize;

              return {
                type: 'cluster',
                popupTemplate: popupTemplate,
                labelingInfo: labelingInfo,
                clusterMinSize: clusterMinSize,
              };
            })
            .catch(function (error) {
              console.error(error);
            });
        }

        return () => {
          if (view) {
            // destroy the map view
            view.destroy();
          }
        };
      }
    );
  });

  return (
    <div className={styles.wrapper}>
      <div className={`webmap ${styles.map}`} ref={mapRef} />
      <Legend />
    </div>
  );
};
