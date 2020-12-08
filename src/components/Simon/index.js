import React, { useEffect, useRef } from 'react';
import { loadCss, loadModules } from 'esri-loader';
import styles from './Map.module.css'; // Import css modules stylesheet as styles

//Utils
import { CountPeople } from '../../util/query';
//Components
import { Legend } from './Legend';

export const SimonMapView = () => {
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
          basemap: 'satellite',
        });

        const view = new MapView({
          container: mapRef.current,
          map: map,
          center: [-88.453743, 47.246247],
          zoom: 9,
          constraints: {
            minScale: 577791,
            maxScale: 144447,
          },
          highlightOptions: {
            fillOpacity: 0,
          },
        });

        const featureLayer = new FeatureLayer({
          url:
            'https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KettGridStatsStatic/FeatureServer',
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
                      colorLocked: false,
                      anchorPoint: { x: 0, y: 0 },
                      anchorPointUnits: 'Relative',
                      primitiveName: 'hexigon',
                      frame: { xmin: 0.0, ymin: 0.0, xmax: 17.0, ymax: 17.0 },
                      markerGraphics: [
                        {
                          type: 'CIMMarkerGraphic',
                          geometry: {
                            rings: [
                              [
                                [12.75, 15.86],
                                [17, 8.5],
                                [12.75, 1.14],
                                [4.25, 1.14],
                                [0, 8.5],
                                [4.25, 15.86],
                                [12.75, 15.86],
                              ],
                            ],
                          },
                          symbol: {
                            type: 'CIMLineSymbol',
                            symbolLayers: [
                              {
                                type: 'CIMSolidStroke',
                                enable: true,
                                capStyle: 'Round',
                                joinStyle: 'Round',
                                lineStyle3D: 'Strip',
                                miterLimit: 10,
                                width: 0,
                                color: [110, 110, 110, 255],
                              },
                              {
                                type: 'CIMSolidFill',
                                enable: true,
                                color: [0, 0, 0, 255],
                              },
                            ],
                          },
                        },
                      ],
                      scaleSymbolsProportionally: true,
                      respectFrame: true,
                    },
                  ],
                  haloSize: 10,
                },
                primitiveOverrides: [
                  {
                    type: 'CIMPrimitiveOverride',
                    primitiveName: 'hexigon',
                    propertyName: 'Size',
                    valueExpressionInfo: {
                      type: 'CIMExpressionInfo',
                      title: 'Size in pixels of outer ring at maxScale',
                      // the pixel size at the largest scale
                      // 42 represents the pixel size of the
                      // circles at the view's largest scale (1:2,311,161)
                      // 1:36111
                      expression: '42 * 144447 / $view.scale',
                      returnType: 'Default',
                    },
                  },
                ],
              },
            },
            visualVariables: [
              {
                type: 'opacity',
                field: 'stories',
                stops: [
                  {
                    value: 0,
                    opacity: 0.3,
                  },
                  {
                    value: 500,
                    opacity: 0.9,
                  },
                ],
              },
              {
                type: 'opacity',
                field: 'buildings',
                stops: [
                  {
                    value: 0,
                    opacity: 0.3,
                  },
                  {
                    value: 10,
                    opacity: 0.5,
                  },
                  {
                    value: 1000,
                    opacity: 0.6,
                  },
                  {
                    value: 5000,
                    opacity: 0.7,
                  },
                  {
                    value: 10000,
                    opacity: 0.9,
                  },
                ],
              },
              {
                type: 'color',
                field: 'people',
                stops: [
                  {
                    value: 0,
                    color: '#B57F00',
                  },
                  {
                    value: 1600,
                    color: '#E6A100',
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
                    fieldName: 'people',
                    label: 'People',
                    format: {
                      places: 0,
                    },
                  },
                  {
                    fieldName: 'buildings',
                    label: 'Buildings',
                    format: {
                      places: 0,
                      digitSeparator: true,
                    },
                  },
                  {
                    fieldName: 'places',
                    label: 'Places',
                    format: {
                      places: 0,
                      digitSeparator: true,
                    },
                  },
                  {
                    fieldName: 'stories',
                    label: 'Stories',
                    format: {
                      places: 0,
                      digitSeparator: true,
                    },
                  },
                ],
              },
            ],
          },
        });

        view.map.add(featureLayer);

        featureLayer
          .when()
          .then((layer) => {
            view.whenLayerView(layer).then((layerView) => {
              let lResult = { attributes: { esri_oid: null } };
              view.on('pointer-move', (event) => {
                view.hitTest(event).then(({ results }) => {
                  const result = results[0];
                  if (result) {
                    console.log(result.graphic);
                    if (result.graphic.layer.id === layer.id) {
                      const savedOid = lResult.attributes.esri_oid;
                      const currentOid = result.graphic.attributes.esri_oid;
                      console.log(savedOid, currentOid);
                      if (savedOid !== currentOid) {
                        console.log(result.graphic);
                        const point = {
                          type: 'point', // autocasts as new Point()
                          latitude: result.graphic.geometry.latitude,
                          longitude: result.graphic.geometry.longitude,
                        };
                        view.popup.open({
                          features: [result.graphic],
                          location: point,
                        });
                        lResult = result.graphic;
                      } else {
                        //view.popup.close();
                      }
                    }
                  }

                  // if (result) {
                  //   if (result.graphic.layer.id === layer.id) {
                  //     if (
                  //       lResult.attributes.NAME !==
                  //       result.graphic.attributes.NAME
                  //     ) {
                  //       view.popup.open({
                  //         features: [result.graphic],
                  //         location: result.graphic.geometry.extent.center,
                  //       });
                  //       lResult = result.graphic;
                  //     }
                  //   }
                  // } else {
                  //   view.popup.close();
                  // }
                });
              });
            });
          })
          .catch((err) => {
            console.log(err);
          });

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

        //view.map.add(peopleLayer);

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

        view.when().then(() => {
          view.watch('scale', function (newValue) {
            const calc = (82 * 36111) / newValue;
            //console.log(calc, newValue);
          });
        });
        // view.when().then(function () {
        //   const layerWurman = view.map.layers.getItemAt(0);
        //   const layerPeople = view.map.layers.getItemAt(1);

        //   view.watch('scale', function (newValue) {
        //     layerWurman.visible = newValue <= 2311162 ? false : true;
        //     layerPeople.visible = newValue <= 2311162 ? true : false;
        //   });

        //   view.whenLayerView(layerPeople).then(function (layerView) {
        //     const filterSelect = document.getElementById('filter');
        //     const searchSelect = document.getElementById('search');
        //     let filterValue = '';
        //     let searchValue = '';
        //     searchSelect.addEventListener('keyup', function (event) {
        //       if (event.key === 'Enter') {
        //         searchValue = event.target.value;
        //         const addFilter = filterValue ? ` AND year = filterValue` : '';
        //         const whereClause = searchValue
        //           ? `firstname = '${searchValue}'${addFilter}`
        //           : null;
        //         //layerView.definitionExpression = whereClause;
        //         layerView.filter = {
        //           where: whereClause,
        //         };
        //         CountPeople(whereClause);
        //         // close popup for former cluster that no longer displays
        //         view.popup.close();
        //       }
        //     });
        //     // filters the layer using a definitionExpression
        //     // based on a year selected by the user
        //     filterSelect.addEventListener('change', function (event) {
        //       filterValue = event.target.value;
        //       const addSearch = searchValue
        //         ? ` AND firstname = '${searchValue}'`
        //         : '';
        //       const whereClause = filterValue
        //         ? `year = ${filterValue}${addSearch}`
        //         : null;
        //       //layerView.definitionExpression = whereClause;
        //       layerView.filter = {
        //         where: whereClause,
        //       };
        //       CountPeople(whereClause);
        //       // close popup for former cluster that no longer displays
        //       view.popup.close();
        //     });
        //   });
        // });
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
