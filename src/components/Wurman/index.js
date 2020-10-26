import React, { useEffect, useRef } from 'react';
import { loadCss, loadModules } from 'esri-loader';
import styles from './Map.module.css'; // Import css modules stylesheet as styles

//Utils
import { CountPeople } from '../../util/query';
//Components
import { Legend } from './Legend';

export const WurmanMapView = () => {
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
        const stories =
          'https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/CCHSDI_StoryPoints_watts/FeatureServer/0';
        const people =
          'https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_CityDir/MapServer/0';

        CountPeople(''); //sending blank string will show all People

        const map = new Map({
          basemap: {
            portalItem: {
              id: '71463912e8ce4ee3a3e4fd307095484b',
            },
          },
        });

        const view = new MapView({
          container: mapRef.current,
          map: map,
          center: [-85, 38],
          zoom: 5,
          // constraints: {
          //   minScale: 18489300,
          //   maxScale: 2311161,
          // },
          highlightOptions: {
            fillOpacity: 0,
          },
        });

        const featureLayer = new FeatureLayer({
          url:
            'https://services1.arcgis.com/4yjifSiIG17X0gW4/arcgis/rest/services/Landcover_30km_centroids_from_hex/FeatureServer',
          renderer: {
            type: 'simple',
            symbol: {
              type: 'cim',
              data: {
                type: 'CIMSymbolReference',
                symbol: {
                  type: 'CIMPointSymbol',
                  symbolLayers: [
                    {
                      type: 'CIMVectorMarker',
                      enable: true,
                      anchorPoint: { x: 0, y: 0 },
                      anchorPointUnits: 'Relative',
                      primitiveName: 'innerSizeOverride',
                      frame: { xmin: 0.0, ymin: 0.0, xmax: 17.0, ymax: 17.0 },
                      markerGraphics: [
                        {
                          type: 'CIMMarkerGraphic',
                          geometry: {
                            rings: [
                              [
                                [8.5, 0.2],
                                [7.06, 0.33],
                                [5.66, 0.7],
                                [4.35, 1.31],
                                [3.16, 2.14],
                                [2.14, 3.16],
                                [1.31, 4.35],
                                [0.7, 5.66],
                                [0.33, 7.06],
                                [0.2, 8.5],
                                [0.33, 9.94],
                                [0.7, 11.34],
                                [1.31, 12.65],
                                [2.14, 13.84],
                                [3.16, 14.86],
                                [4.35, 15.69],
                                [5.66, 16.3],
                                [7.06, 16.67],
                                [8.5, 16.8],
                                [9.94, 16.67],
                                [11.34, 16.3],
                                [12.65, 15.69],
                                [13.84, 14.86],
                                [14.86, 13.84],
                                [15.69, 12.65],
                                [16.3, 11.34],
                                [16.67, 9.94],
                                [16.8, 8.5],
                                [16.67, 7.06],
                                [16.3, 5.66],
                                [15.69, 4.35],
                                [14.86, 3.16],
                                [13.84, 2.14],
                                [12.65, 1.31],
                                [11.34, 0.7],
                                [9.94, 0.33],
                                [8.5, 0.2],
                              ],
                            ],
                          },
                          symbol: {
                            type: 'CIMPolygonSymbol',
                            symbolLayers: [
                              {
                                type: 'CIMSolidFill',
                                enable: true,
                                color: [0, 0, 0, 30],
                              },
                            ],
                          },
                        },
                      ],
                      scaleSymbolsProportionally: true,
                      respectFrame: true,
                    },
                    {
                      type: 'CIMVectorMarker',
                      enable: true,
                      anchorPoint: { x: 0, y: 0 },
                      anchorPointUnits: 'Relative',
                      primitiveName: 'outerSizeOverride',
                      frame: { xmin: 0.0, ymin: 0.0, xmax: 17.0, ymax: 17.0 },
                      markerGraphics: [
                        {
                          type: 'CIMMarkerGraphic',
                          geometry: {
                            rings: [
                              [
                                [8.5, 0.2],
                                [7.06, 0.33],
                                [5.66, 0.7],
                                [4.35, 1.31],
                                [3.16, 2.14],
                                [2.14, 3.16],
                                [1.31, 4.35],
                                [0.7, 5.66],
                                [0.33, 7.06],
                                [0.2, 8.5],
                                [0.33, 9.94],
                                [0.7, 11.34],
                                [1.31, 12.65],
                                [2.14, 13.84],
                                [3.16, 14.86],
                                [4.35, 15.69],
                                [5.66, 16.3],
                                [7.06, 16.67],
                                [8.5, 16.8],
                                [9.94, 16.67],
                                [11.34, 16.3],
                                [12.65, 15.69],
                                [13.84, 14.86],
                                [14.86, 13.84],
                                [15.69, 12.65],
                                [16.3, 11.34],
                                [16.67, 9.94],
                                [16.8, 8.5],
                                [16.67, 7.06],
                                [16.3, 5.66],
                                [15.69, 4.35],
                                [14.86, 3.16],
                                [13.84, 2.14],
                                [12.65, 1.31],
                                [11.34, 0.7],
                                [9.94, 0.33],
                                [8.5, 0.2],
                              ],
                            ],
                          },
                          symbol: {
                            type: 'CIMLineSymbol',
                            symbolLayers: [
                              {
                                type: 'CIMSolidStroke',
                                enable: true,
                                color: [150, 150, 150, 50],
                                width: 1,
                              },
                            ],
                          },
                        },
                      ],
                      scaleSymbolsProportionally: true,
                      respectFrame: true,
                    },
                  ],
                },
                primitiveOverrides: [
                  {
                    type: 'CIMPrimitiveOverride',
                    primitiveName: 'outerSizeOverride',
                    propertyName: 'Size',
                    valueExpressionInfo: {
                      type: 'CIMExpressionInfo',
                      title: 'Size in pixels of outer ring at maxScale',
                      // the pixel size at the largest scale
                      // 42 represents the pixel size of the
                      // circles at the view's largest scale (1:2,311,161)
                      expression: '42 * 2311161 / $view.scale',
                      returnType: 'Default',
                    },
                  },
                  {
                    type: 'CIMPrimitiveOverride',
                    primitiveName: 'innerSizeOverride',
                    propertyName: 'Size',
                    valueExpressionInfo: {
                      type: 'CIMExpressionInfo',
                      title: 'Size in pixels of inner ring at maxScale',
                      // outerSize is the pixel size at the largest scale
                      // The innerSize is determined by multiplying
                      // the outerSize by the forest ratio
                      expression: `
                        var forestRatio = $feature.NLCDfrstPt / 100;
                        var outerSize = 42 * 2311161 / $view.scale;
                        var innerSize = outerSize * forestRatio;
                        return IIF( innerSize < 3, 3, innerSize );
                      `,
                      returnType: 'Default',
                    },
                  },
                ],
              },
            },
            visualVariables: [
              {
                type: 'color',
                field: 'POP2010',
                stops: [
                  {
                    value: 0,
                    color: [57, 74, 53],
                  },
                  {
                    value: 15000,
                    color: [94, 120, 89],
                  },
                  {
                    value: 30000,
                    color: [235, 227, 215],
                  },
                  {
                    value: 90000,
                    color: [199, 143, 70],
                  },
                  {
                    value: 150000,
                    color: [201, 114, 0],
                  },
                ],
              },
            ],
          },
          popupTemplate: {
            content: [
              {
                type: 'fields',
                fieldInfos: [
                  {
                    fieldName: 'NLCDfrstPt',
                    label: '% forested land (NLCD)',
                    format: {
                      places: 0,
                    },
                  },
                  {
                    fieldName: 'POP2010',
                    label: 'Population (2010)',
                    format: {
                      places: 0,
                      digitSeparator: true,
                    },
                  },
                ],
              },
            ],
          },
          definitionExpression: 'NLCDfrstPt > 1',
        });
        view.map.add(featureLayer);

        const peopleLayer = new FeatureLayer({
          title: 'People',
          url: people,
          outFields: ['*'],
          renderer: {
            type: 'simple',
            symbol: {
              type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
              // Arrow marker
              path:
                'M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z',
              color: '#3b7977',
              outline: {
                color: '#ffffff',
                width: 2,
              },
              size: 15,
            },
          },
          visible: false,
        });

        view.map.add(peopleLayer);

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
          const layerWurman = view.map.layers.getItemAt(0);
          const layerPeople = view.map.layers.getItemAt(1);

          view.watch('scale', function (newValue) {
            layerWurman.visible = newValue <= 2311162 ? false : true;
            layerPeople.visible = newValue <= 2311162 ? true : false;
          });

          view.whenLayerView(layerPeople).then(function (layerView) {
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
