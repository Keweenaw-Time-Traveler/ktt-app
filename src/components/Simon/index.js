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
        'dojo/dom',
        'esri/symbols/support/cimSymbolUtils',
        'esri/widgets/BasemapToggle',
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
        dom,
        cimSymbolUtils,
        BasemapToggle,
      ]) => {
        const hexGrid = new FeatureLayer({
          url:
            'https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KettGridStatsStatic/FeatureServer',
          outFields: ['*'],
          renderer: {
            type: 'simple',
            symbol: {
              type: 'web-style',
              name: 'hexagon-1',
              styleName: 'Esri2DPointSymbolsStyle',
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
            ],
          },
        });

        // convert webstyle symbol to CIMSymbol
        hexGrid.renderer.symbol.fetchCIMSymbol().then(function (cimSymbol) {
          hexGrid.renderer.symbol = cimSymbol;
          hexGrid.renderer.symbol.data.primitiveOverrides = [
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
          ];
        });

        const dotsGrid = new FeatureLayer({
          url:
            'https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KettGridStatsStatic/FeatureServer',
          outFields: ['*'],
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
            ],
          },
        });

        const simonGrid = new FeatureLayer({
          url:
            'https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KettGridStatsStatic/FeatureServer',
          outFields: ['*'],
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
                                color: [255, 255, 255, 255],
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
                                color: [255, 255, 255, 255],
                                width: 0.5,
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
                      expression: '42 * 144447 / $view.scale',
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
                        var people = $feature.people;
                        var buildings = $feature.buildings;
                        var places = $feature.places;
                        var stories = $feature.stories;
                        var total = people + buildings + places + stories;
                        var ratio = total / 1800;
                        var mutiplier = IIF( ratio >= 0.7, 0.7, ratio );
                        var outerSize = 42 * 144447 / $view.scale;
                        var innerSizeMin = outerSize * 0.2;
                        var innerSize = outerSize * mutiplier;
                        return IIF( innerSize < 3, innerSizeMin, innerSize );
                      `,
                      returnType: 'Default',
                    },
                  },
                ],
              },
            },
            // visualVariables: [
            //   {
            //     type: "color",
            //     field: "POP2010",
            //     stops: [
            //       {
            //         value: 0,
            //         color: [57, 74, 53]
            //       },
            //       {
            //         value: 15000,
            //         color: [94, 120, 89]
            //       },
            //       {
            //         value: 30000,
            //         color: [235, 227, 215]
            //       },
            //       {
            //         value: 90000,
            //         color: [199, 143, 70]
            //       },
            //       {
            //         value: 150000,
            //         color: [201, 114, 0]
            //       }
            //     ]
            //   }
            // ]
          },
          popupTemplate: {
            content: [
              {
                type: 'fields',
                fieldInfos: [
                  {
                    fieldName: 'expression/people',
                  },
                  {
                    fieldName: 'expression/buildings',
                  },
                  {
                    fieldName: 'expression/places',
                  },
                  {
                    fieldName: 'expression/stories',
                  },
                  {
                    fieldName: 'expression/total',
                  },
                ],
              },
            ],
            // autocasts to ExpressionInfo class
            expressionInfos: [
              {
                name: 'people',
                title: 'People',
                expression: '$feature.people',
              },
              {
                name: 'buildings',
                title: 'Buildings',
                expression: '$feature.buildings',
              },
              {
                name: 'places',
                title: 'Places',
                expression: '$feature.places',
              },
              {
                name: 'stories',
                title: 'Stories',
                expression: '$feature.stories',
              },
              {
                name: 'total',
                title: 'Total',
                expression:
                  '$feature.people + $feature.buildings + $feature.places + $feature.stories',
              },
            ],
          },
          // definitionExpression: 'NLCDfrstPt > 1',
        });

        const map = new Map({
          //basemap: 'gray-vector',
          basemap: 'satellite',
          layers: [simonGrid], // add layers to the map
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

        view.watch('scale', function (scale) {
          //console.log(scale);
        });

        const toggle = new BasemapToggle({
          // 2 - Set properties
          view: view, // view that provides access to the map's 'topo-vector' basemap
          nextBasemap: 'gray-vector', // allows for toggling to the 'hybrid' basemap
        });

        // Add widget to the top right corner of the view
        view.ui.add(toggle, 'top-right');

        simonGrid
          .when()
          .then(changeColor)
          .catch(function (error) {
            console.error(error);
          });

        window.currentColor = 0;
        window.colors = [
          '#FFFFFF',
          '#272626',
          '#5F958F',
          '#027487',
          '#CE344F',
          '#DF5E1F',
        ];

        function changeColor(layer) {
          const picker = document.getElementById('picker');
          const custom = document.getElementById('custom-color');
          const add = document.getElementById('add');

          picker.addEventListener('click', function (event) {
            const newSymbol = simonGrid.renderer.symbol.clone();
            const length = window.colors.length;

            const nextColor = window.currentColor + 1;

            if (nextColor > length - 1) {
              window.currentColor = 0;
            } else {
              window.currentColor = nextColor;
            }
            cimSymbolUtils.applyCIMSymbolColor(
              newSymbol,
              window.colors[window.currentColor]
            );
            simonGrid.renderer = {
              type: 'simple',
              symbol: newSymbol,
            };
          });

          add.addEventListener('click', function (event) {
            const hex = custom.value;
            window.colors.push(hex);
            const newSymbol = simonGrid.renderer.symbol.clone();
            const length = window.colors.length;
            window.currentColor = length - 1;
            cimSymbolUtils.applyCIMSymbolColor(
              newSymbol,
              window.colors[window.currentColor]
            );
            simonGrid.renderer = {
              type: 'simple',
              symbol: newSymbol,
            };
          });
        }

        function getGraphics(response) {
          // the topmost graphic from the click location
          // and display select attribute values from the
          // graphic to the user
          const graphic = response.graphic;
          const {
            grid_id,
            buildings,
            people,
            places,
            stories,
          } = graphic.attributes;
          console.log(grid_id, buildings, people, places, stories);
          console.log(graphic);

          console.log(dotsGrid.renderer.symbol);

          const newSymbol = dotsGrid.renderer.symbol.clone(); // clone the current symbol
          cimSymbolUtils.scaleCIMSymbolTo(newSymbol, '25'); // use CIM util function to scale the symbol to a new size
          // update the renderer to the new symbol
          dotsGrid.renderer = {
            type: 'simple',
            symbol: newSymbol,
          };

          // dom.byId("info").style.visibility = "visible";
          // dom.byId("name").innerHTML = name;
          // dom.byId("category").innerHTML = "Category " + category;
          // dom.byId("wind").innerHTML = wind + " kts";

          // // symbolize all line segments with the given
          // // storm name with the same symbol
          // var renderer = {
          //   type: 'unique-value', // autocasts as new UniqueValueRenderer()
          //   field: 'grid_id',
          //   defaultSymbol:
          //     featureLayer.renderer.symbol ||
          //     featureLayer.renderer.defaultSymbol,
          //   uniqueValueInfos: [
          //     {
          //       value: grid_id,
          //       symbol: {
          //         type: 'cim',
          //         data: {
          //           type: 'CIMSymbolReference',
          //           symbol: {
          //             type: 'CIMPointSymbol',
          //             symbolLayers: [
          //               {
          //                 type: 'CIMVectorMarker',
          //                 enable: true,
          //                 colorLocked: false,
          //                 anchorPoint: { x: 0, y: 0 },
          //                 anchorPointUnits: 'Relative',
          //                 primitiveName: 'hexigon',
          //                 frame: {
          //                   xmin: 0.0,
          //                   ymin: 0.0,
          //                   xmax: 17.0,
          //                   ymax: 17.0,
          //                 },
          //                 markerGraphics: [
          //                   {
          //                     type: 'CIMMarkerGraphic',
          //                     geometry: {
          //                       rings: [
          //                         [
          //                           [12.75, 15.86],
          //                           [17, 8.5],
          //                           [12.75, 1.14],
          //                           [4.25, 1.14],
          //                           [0, 8.5],
          //                           [4.25, 15.86],
          //                           [12.75, 15.86],
          //                         ],
          //                       ],
          //                     },
          //                     symbol: {
          //                       type: 'CIMLineSymbol',
          //                       symbolLayers: [
          //                         {
          //                           type: 'CIMSolidStroke',
          //                           enable: true,
          //                           capStyle: 'Round',
          //                           joinStyle: 'Round',
          //                           lineStyle3D: 'Strip',
          //                           miterLimit: 10,
          //                           width: 0,
          //                           color: [255, 0, 0, 255],
          //                         },
          //                         {
          //                           type: 'CIMSolidFill',
          //                           enable: true,
          //                           color: [255, 0, 0, 255],
          //                         },
          //                       ],
          //                     },
          //                   },
          //                 ],
          //                 scaleSymbolsProportionally: true,
          //                 respectFrame: true,
          //               },
          //             ],
          //           },
          //         },
          //       },
          //     },
          //   ],
          // };
          // featureLayer.renderer = renderer;
        }

        hexGrid
          .when()
          .then((layer) => {
            view.whenLayerView(layer).then((layerView) => {
              let lResult = { attributes: { esri_oid: null } };
              view.on('pointer-move', (event) => {
                view.hitTest(event).then(({ results }) => {
                  const result = results[0];
                  if (result) {
                    //console.log(result.graphic);
                    if (result.graphic.layer.id === layer.id) {
                      const savedOid = lResult.attributes.esri_oid;
                      const currentOid = result.graphic.attributes.esri_oid;
                      //console.log(savedOid, currentOid);
                      if (savedOid !== currentOid) {
                        //console.log(result.graphic);
                        // const point = {
                        //   type: 'point', // autocasts as new Point()
                        //   latitude: result.graphic.geometry.latitude,
                        //   longitude: result.graphic.geometry.longitude,
                        // };
                        // view.popup.open({
                        //   features: [result.graphic],
                        //   location: point,
                        // });
                        // lResult = result.graphic;
                        getGraphics(result);
                      } else {
                        //view.popup.close();
                      }
                    }
                  }
                });
              });
            });
          })
          .catch((err) => {
            console.log(err);
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
        //view.ui.add(slider, 'top-right');

        // view.when().then(() => {
        //   view.watch('scale', function (newValue) {
        //     const calc = (82 * 36111) / newValue;
        //     //console.log(calc, newValue);
        //   });
        // });
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
      <button id="picker" className={styles.picker}>
        Change Color
      </button>
      <input
        type="text"
        id="custom-color"
        className={styles.custom}
        placeholder="Custom Color Hex"
      ></input>
      <button id="add" className={styles.add}>
        Add
      </button>
    </div>
  );
};
