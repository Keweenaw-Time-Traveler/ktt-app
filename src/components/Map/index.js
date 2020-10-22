import React, { useEffect, useRef } from 'react';
import { loadCss, loadModules } from 'esri-loader';
import axios from 'axios';
import styles from './Map.module.css'; // Import css modules stylesheet as styles

//Utils
import { CountPeople } from '../../util/query';
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
      ]) => {
        const stories =
          'https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/CCHSDI_StoryPoints_watts/FeatureServer/0';
        const people =
          'https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_CityDir/MapServer/0';

        CountPeople(''); //sending blank string will show all People

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
          // renderer: {
          //   type: 'simple',
          //   symbol: {
          //     type: 'simple-marker',
          //     size: 8,
          //     color: '#3b7977',
          //     outline: {
          //       color: '#ffffff',
          //       width: 2,
          //     },
          //   },
          // },
          renderer: {
            type: 'simple',
            symbol: {
              type: 'simple-marker',
              size: 8,
              color: '#3b7977',
              outline: {
                color: '#ffffff',
                width: 2,
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
          basemap: 'satellite',
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
        const expand = new Expand({
          view: view,
          content: infoDiv,
          expandIconClass: 'esri-icon-layer-list',
          expanded: false,
        });

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
        view.ui.add(expand, 'top-right');
        view.ui.add(slider, 'top-right');

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
              const searchSelect = document.getElementById('search');
              let filterValue = '';
              let searchValue = '';
              searchSelect.addEventListener('keyup', function (event) {
                if (event.key === 'Enter') {
                  searchValue = event.target.value;
                  const addFilter = filterValue
                    ? ` AND year = filterValue`
                    : '';
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
              //const labelingInfo = primaryLabelScheme.labelingInfo;
              const labelingInfo = [
                {
                  labelExpressionInfo: {
                    expression:
                      'IIf($feature.cluster_count > 1000, Text(($feature.cluster_count/1000), "#k"), $feature.cluster_count)',
                  },
                  deconflictionStrategy: 'none',
                  labelPlacement: 'center-center',
                  symbol: {
                    type: 'text',
                    color: 'white',
                    font: {
                      size: '16px',
                    },
                  },
                },
              ];
              // Ensures the clusters are large enough to fit labels
              const clusterMinSize = primaryLabelScheme.clusterMinSize;

              return {
                type: 'cluster',
                clusterRadius: 100,
                clusterMaxSize: 80,
                popupTemplate: popupTemplate,
                labelingInfo: labelingInfo,
                clusterMinSize: clusterMinSize + 20,
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
      <div id="slider" className={styles.slider}></div>
    </div>
  );
};
