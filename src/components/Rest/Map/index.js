//React
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
//Redux
import { useSelector } from 'react-redux';
import { selectFiltersAll } from '../../../redux/reducers/filtersSlice';
//Components
import Loader from './Loader';
import Chooser from './Chooser';
//ArchGIS
import { loadModules } from 'esri-loader';
// import Map from '@arcgis/core/Map';
// import MapView from '@arcgis/core/views/MapView';
// import Basemap from '@arcgis/core/Basemap';
// import Graphic from '@arcgis/core/Graphic';
// import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
// import TileLayer from '@arcgis/core/layers/TileLayer';
// import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
// import SpatialReference from '@arcgis/core/geometry/SpatialReference';
// import * as watchUtils from '@arcgis/core/core/watchUtils.js';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/pro-solid-svg-icons';
//Styles
import './styles.scss';
//Images
import everythingMarkerImage from './images/marker_everything.png';
import peopleMarkerImage from './images/marker_person.png';
import placeMarkerImage from './images/marker_place.png';
import storyMarkerImage from './images/marker_story.png';
//Functional Component
function KeTTMap() {
  const [loader, updateLoader] = useState('Loading Grid...');
  const [zoom, setZoom] = useState(10);
  const [search, setSearch] = useState('');
  const [date_range, setDateRange] = useState('1800-2020');
  const [startDate, setStartDate] = useState('1800');
  const [endDate, setEndDate] = useState('2020');
  const [location, setLocation] = useState('Keweenaw');
  const [photos, setPhotos] = useState('false');
  const [featured, setFeatured] = useState('false');
  const [type, setType] = useState('all');
  const [loadingMarkers, setLoadingMarkers] = useState(false);
  const [showTimeChooser, setShowTimeChooser] = useState(false);
  const mapRef = useRef();
  const filters = useSelector(selectFiltersAll);

  useEffect(() => {
    setDateRange(filters.dateRange);
  }, [filters]);

  useEffect(() => {
    loadModules(
      [
        'esri/Map',
        'esri/views/MapView',
        'esri/Basemap',
        'esri/layers/VectorTileLayer',
        'esri/layers/TileLayer',
        'esri/layers/FeatureLayer',
        'esri/geometry/Point',
        'esri/Graphic',
        'esri/layers/GraphicsLayer',
        'esri/geometry/SpatialReference',
        'esri/symbols/CIMSymbol',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/symbols/SimpleLineSymbol',
        'esri/renderers/SimpleRenderer',
        'esri/core/watchUtils',
        'esri/Color',
      ],
      {
        css: true,
      }
    ).then(
      ([
        Map,
        MapView,
        Basemap,
        VectorTileLayer,
        TileLayer,
        FeatureLayer,
        Point,
        Graphic,
        GraphicsLayer,
        SpatialReference,
        CIMSymbol,
        SimpleMarkerSymbol,
        SimpleLineSymbol,
        SimpleRenderer,
        watchUtils,
        Color,
      ]) => {
        //console.log('STATE LIST VALUE', listValue);

        const startingExtent = {
          xmin: -9967422.996979957,
          xmax: -9727563.602220984,
          ymin: 5868928.760112602,
          ymax: 6054212.116675941,
        };

        const modern_antique = new Basemap({
          baseLayers: [
            new TileLayer({
              portalItem: {
                id: '1b243539f4514b6ba35e7d995890db1d', // World Hillshade
              },
            }),
            new VectorTileLayer({
              portalItem: {
                // autocasts as new PortalItem()
                id: 'effe3475f05a4d608e66fd6eeb2113c0',
              },
            }),
          ],
        });

        const view = new MapView({
          map: new Map({
            basemap: modern_antique,
          }),
          container: mapRef.current,
          extent: {
            spatialReference: { wkid: 3857 },
            xmin: startingExtent.xmin,
            xmax: startingExtent.xmax,
            ymin: startingExtent.ymin,
            ymax: startingExtent.ymax,
          },
        });

        view
          .when()
          .then(() => {
            //Putting the view object somewhere it can be used in other components
            window.kettView = view;
            const { xmin, xmax, ymin, ymax } = view.extent;
            window.markerExtent = null; //Used to determine if markers need to be updated, see watchUtils.whenTrue below
            window.timePeriod = null; //Used to determine if time period needs to be chosen, see watchUtils.whenTrue below
            const startingExtent = {
              xmin: xmin,
              xmax: xmax,
              ymin: ymin,
              ymax: ymax,
            };
            const startingFilters = {
              search: '',
              date_range: '1800-2020',
              startDate: '1800',
              endDate: '2020',
              location: 'Keweenaw',
              photos: 'false',
              featured: 'false',
              type: 'all',
            };
            updateGrid(view, startingFilters);

            // asyncMarkers(view, startingFilters, startingExtent).then((res) => {
            //   console.log('MARKER MAP RESPONCE', res);
            //   //dispatch(updateList(res));
            //   if (view.zoom > 16) {
            //     generateMarkers(res);
            //   }
            // });

            const searchField = document.getElementById('search');
            const typeRadio = document.querySelectorAll('.radio-button');
            const typeToggle = document.querySelectorAll('.filter-toogle');
            console.log('WILL IT CHANGE', date_range);
            //Time Chooser Event
            //Delayed to make sure elements have loaded before listener is added
            setTimeout(() => {
              const timeChooser = document.getElementById(
                'time-chooser-select'
              );
              timeChooser.addEventListener('change', (event) => {
                event.preventDefault();
                setDateRange(event.target.value);
                const filterVal = {
                  search,
                  date_range: `${event.target.value}`,
                  startDate,
                  endDate,
                  location,
                  photos,
                  featured,
                  type,
                };
                const extentClone = view.extent.clone();
                const extentExpanded = extentClone.expand(1.5);
                const { xmin, xmax, ymin, ymax } = extentExpanded;
                const extent = {
                  xmin: xmin,
                  xmax: xmax,
                  ymin: ymin,
                  ymax: ymax,
                };
                console.log('TIME CHOOSER CHANGE', filterVal);
                //LOAD MARKERS
                asyncMarkers(view, filterVal, extent).then((res) => {
                  console.log('MARKER RESPONCE', res);
                  generateMarkers(res);
                });
              });
            }, 4000);

            //Landing Search Button Event
            //Delayed to make sure elements have loaded before listener is added
            setTimeout(() => {
              const landingSearch = document.getElementById('search-landing');
              const landingSearchIcon = document.getElementById(
                'intro-options-search-icon'
              );
              landingSearchIcon.addEventListener('click', (event) => {
                setSearch(`${landingSearch.value}`);
                const filterVal = {
                  search: `${landingSearch.value}`,
                  date_range,
                  startDate,
                  endDate,
                  location,
                  photos,
                  featured,
                  type,
                };
                console.log('LANDING BUTTON CLICKED', filterVal);
                updateGrid(view, filterVal);
              });
            }, 4000);
            //Search Field Event
            searchField.addEventListener('change', (event) => {
              event.preventDefault();
              setSearch(`${event.target.value}`);
              const filterVal = {
                search: `${event.target.value}`,
                date_range,
                startDate,
                endDate,
                location,
                photos,
                featured,
                type,
              };
              const extentClone = view.extent.clone();
              const extentExpanded = extentClone.expand(1.5);
              const { xmin, xmax, ymin, ymax } = extentExpanded;
              const extent = {
                xmin: xmin,
                xmax: xmax,
                ymin: ymin,
                ymax: ymax,
              };
              const isInside = extentExpanded.contains(extentClone);
              console.log('SEARCH CHANGE', filterVal);
              if (view.zoom <= 16) {
                updateGrid(view, filterVal);
              }
              //LOAD MARKERS
              if (event.target.value != '') {
                asyncMarkers(view, filterVal, extent).then((res) => {
                  console.log('MARKER RESPONCE', res);
                  if (view.zoom > 10) {
                    generateMarkers(res);
                  }
                });
              }
            });
            //Radio Change Event
            typeRadio.forEach((el) =>
              el.addEventListener('change', (event) => {
                event.preventDefault();
                setType(`${event.target.value}`);
                const filterVal = {
                  search: search.value,
                  date_range,
                  startDate,
                  endDate,
                  location,
                  photos,
                  featured,
                  type: `${event.target.value}`,
                };
                const { xmin, xmax, ymin, ymax } = view.extent;
                const extent = {
                  xmin: xmin,
                  xmax: xmax,
                  ymin: ymin,
                  ymax: ymax,
                };
                //console.log('RADIO', filters);
                if (view.zoom <= 16) {
                  updateGrid(view, filterVal);
                }
                //LOAD MARKERS (MAP)
                asyncMarkers(view, filterVal, extent).then((res) => {
                  console.log('MARKER RESPONCE', res);
                  //dispatch(updateList(res));
                  if (view.zoom > 16) {
                    generateMarkers(res);
                  }
                });
              })
            );
            //Toogle Change Event
            typeToggle.forEach((el) =>
              el.addEventListener('change', (event) => {
                event.preventDefault();
                const id = event.target.id;
                const checked = event.target.checked;
                let filterVal = {};
                const { xmin, xmax, ymin, ymax } = view.extent;
                const extent = {
                  xmin: xmin,
                  xmax: xmax,
                  ymin: ymin,
                  ymax: ymax,
                };
                //console.log(event.target.id);
                if (id === 'photos') {
                  setPhotos(`${checked}`);
                  filterVal = {
                    search: search.value,
                    date_range,
                    startDate,
                    endDate,
                    location,
                    photos: `${checked}`,
                    featured,
                    type,
                  };
                }
                if (id === 'featured') {
                  setFeatured(`${checked}`);
                  filterVal = {
                    search: search.value,
                    date_range,
                    startDate,
                    endDate,
                    location,
                    photos,
                    featured: `${checked}`,
                    type,
                  };
                }
                console.log('TOGGLE', filterVal);
                if (view.zoom <= 16) {
                  updateGrid(view, filterVal);
                }
                //LOAD MARKERS (MAP)
                asyncMarkers(view, filterVal, extent).then((res) => {
                  console.log('MARKER RESPONCE', res);
                  //dispatch(updateList(res));
                  if (view.zoom > 16) {
                    generateMarkers(res);
                  }
                });
              })
            );
          })
          .catch(function (e) {
            console.error('Creating FeatureLayer failed', e);
          });

        view.on('click', function (event) {
          view.hitTest(event).then(function (response) {
            // do something with the result graphic
            var graphic = response.results[0].graphic;
            console.log('GRAPHIC ATTR', graphic.attributes);
          });
        });

        watchUtils.whenTrue(view, 'stationary', function () {
          if (view.ready && view.extent) {
            console.log('VIEW EXTENT', view.extent);
            //console.log('VIEW SCALE', view.scale);
            //console.log('VIEW ZOOM', view.zoom);
            window.kettView = view;
            setZoom(view.zoom);
            const searchDOM = document.getElementById('search');
            const dateRangeDOM = document.getElementById('date-range');
            const typeRadio = document.querySelector(
              'input[name="filterType"]:checked'
            );
            const markerExtent = window.markerExtent;
            const timePeriod = window.timePeriod;
            const extentClone = view.extent.clone();
            //setNoTimePeriod

            if (view.zoom > 18 && !timePeriod) {
              setShowTimeChooser(true);
              setLoadingMarkers(false);
            } else if (view.zoom > 18) {
              if (!markerExtent) {
                console.log('WINDOW', markerExtent);
                window.markerExtent = extentClone.expand(3);
              }

              const isInside = window.markerExtent.contains(extentClone);
              console.log('Is inside', isInside);

              //LOAD MARKERS
              if (!isInside) {
                const expanded = view.extent.clone().expand(3);
                window.markerExtent = expanded;
                const { xmin, xmax, ymin, ymax } = expanded;
                const extent = {
                  xmin: xmin,
                  xmax: xmax,
                  ymin: ymin,
                  ymax: ymax,
                };
                const filters = {
                  search: searchDOM.value,
                  date_range: dateRangeDOM.textContent,
                  photos: 'false',
                  featured: 'false',
                  type: typeRadio.value,
                };
                asyncMarkers(view, filters, extent).then((res) => {
                  console.log('MARKER MAP RESPONCE', res);
                  generateMarkers(res);
                });
              }
            }
            //SHOW HIDE LAYERS
            const layers = view.map.layers;
            if (layers) {
              //console.log('LAYERS', layers.length);
              layers.items.forEach((layer, index) => {
                if (view.zoom <= 10) {
                  if (layer.id === 'grid_layer_10') {
                    console.log('SHOW', layer.id);
                    layer.visible = true;
                  }
                  if (layer.id === 'grid_layer_1') {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (layer.id === 'grid_layer_01') {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (
                    layer.id === 'marker_layer_active' ||
                    layer.id === 'marker_layer_inactive'
                  ) {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                } else if (view.zoom > 10 && view.zoom <= 13) {
                  if (layer.id === 'grid_layer_10') {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (layer.id === 'grid_layer_1') {
                    console.log('SHOW', layer.id);
                    layer.visible = true;
                  }
                  if (layer.id === 'grid_layer_01') {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (
                    layer.id === 'marker_layer_active' ||
                    layer.id === 'marker_layer_inactive'
                  ) {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                } else if (view.zoom > 13 && view.zoom <= 18) {
                  if (layer.id === 'grid_layer_10') {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (layer.id === 'grid_layer_1') {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (layer.id === 'grid_layer_01') {
                    console.log('SHOW', layer.id);
                    layer.visible = true;
                  }
                  if (
                    layer.id === 'marker_layer_active' ||
                    layer.id === 'marker_layer_inactive'
                  ) {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                } else if (view.zoom > 18) {
                  if (layer.id === 'grid_layer_10') {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (layer.id === 'grid_layer_1') {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (layer.id === 'grid_layer_01') {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (
                    layer.id === 'marker_layer_active' ||
                    layer.id === 'marker_layer_inactive'
                  ) {
                    console.log('SHOW', layer.id);
                    layer.visible = true;
                  }
                }
              });
            }
          }
        });

        function updateGrid(view, filters) {
          //GRID 10k
          asyncGrid(view, filters, '10').then((res) => {
            console.log('GRID 10k RESPONCE', res);
            //generateGridInactive(res.inactive);
            generateGrid(res.active, '10', '69');
          });
          //GRID 1k
          asyncGrid(view, filters, '1').then((res) => {
            console.log('GRID 1k RESPONCE', res);
            //generateGridInactive(res.inactive);
            generateGrid(res.active, '1', '6.5');
          });
          //GRID 0.1k
          asyncGrid(view, filters, '01').then((res) => {
            console.log('GRID 0.1k RESPONCE', res);
            //generateGridInactive(res.inactive);
            generateGrid(res.active, '01', '0.6');
          });
        }

        function generateGrid(cells, size, radius) {
          const gridActive = cells.results;
          const gridGraphics = [];
          gridActive.forEach((cell) => {
            //console.log('CELL', cell);
            if (cell.centroid.lon) {
              const point = {
                type: 'point',
                x: cell.centroid.lon,
                y: cell.centroid.lat,
                spatialReference: new SpatialReference({ wkid: 3857 }),
              };
              const attr = { ...cell, size, radius };
              //console.log('ATTR', attr);
              const cellGraphic = new Graphic({
                geometry: point,
                attributes: attr,
              });
              gridGraphics.push(cellGraphic);
            } else {
              console.log(
                'EMPTY ACTIVE GRID VALUE - ID: ',
                cell.id,
                'X: ',
                cell.centroid.lon
              );
            }
          });
          createGridLayer(gridGraphics, size);
        }

        function createGridLayer(graphics, size) {
          const gridSymbol = {
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
                              color: [150, 150, 150],
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
                              colorLocked: true,
                              color: [0, 0, 0, 255],
                              width: 1,
                            },
                          ],
                        },
                      },
                    ],
                    scaleSymbolsProportionally: false,
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
                    expression:
                      '($feature.radius * 577790.554289 / $view.scale)',
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
                    // return IIF( $feature.percent < 1, innerSizeMin, innerSize-2 );
                    // return IIF( $feature.montenum < 0.1, innerSizeMin, innerSize );
                    // return innerSize;
                    expression: `
                        var outerSize = $feature.radius * 577790.554289 / $view.scale;
                        var innerSizeMin = outerSize * 0.08;
                        var innerSize = (outerSize * $feature.montenum)*0.8;
                        return innerSize;
                      `,
                    returnType: 'Default',
                  },
                },
              ],
            },
          };
          const show = size === '10' ? true : false;
          const grid = new FeatureLayer({
            id: `grid_layer_${size}`,
            visible: show,
            source: graphics,
            fields: [
              {
                name: 'id',
                alias: 'ID',
                type: 'string',
              },
              {
                name: 'percent',
                alias: 'Percent',
                type: 'string',
              },
              {
                name: 'montenum',
                alias: 'Montenum',
                type: 'string',
              },
              {
                name: 'count',
                alias: 'Count',
                type: 'string',
              },
              {
                name: 'type',
                alias: 'Type',
                type: 'string',
              },
              {
                name: 'radius',
                alias: 'Radius',
                type: 'string',
              },
            ],
            objectIdField: 'ObjectID',
            geometryType: 'point',
            renderer: {
              type: 'simple',
              symbol: gridSymbol,
              visualVariables: [
                {
                  type: 'color',
                  valueExpression: `
                    var type = $feature.type;
                    var typeID = When(
                      type == 'person', 1,
                      type == 'story', 2,
                      type == 'place', 3,
                      type == 'everything', 4,
                      0
                      );
                    return typeID;
                    `,
                  stops: [
                    {
                      value: 0,
                      color: [0, 0, 0],
                    },
                    {
                      value: 1,
                      color: [0, 0, 0],
                      //color: [64, 132, 130],
                    },
                    {
                      value: 2,
                      color: [0, 0, 0],
                      //color: [204, 97, 49],
                    },
                    {
                      value: 3,
                      color: [0, 0, 0],
                      //color: [154, 98, 181],
                    },
                    {
                      value: 4,
                      color: [0, 0, 0],
                    },
                  ],
                },
              ],
            },
            popupTemplate: {
              title: 'ACTIVE | {id} | {montenum} | {type}',
              content: asyncPopUp,
            },
          });
          addToView(grid);
        }

        function generateMarkers(markers) {
          //console.log('generateMarkers', markers);
          // const peopleActive = markers.active.people ? markers.active.people.results : [];
          // const placesActive = markers.active.places ? markers.active.places.results : [];
          // const storiesActive = markers.active.stories ? markers.active.stories.results : [];
          // const allActive = [
          //   ...peopleActive,
          //   ...placesActive,
          //   ...storiesActive,
          // ];
          const allActive = markers.active.length ? markers.active.results : [];
          const allInActive = markers.inactive.length
            ? markers.inactive.results
            : [];
          //console.log('allActive', allActive);
          const activeGraphics = [];
          const inactiveGraphics = [];
          allActive.forEach((marker) => {
            if (marker.x) {
              const point = {
                type: 'point',
                x: marker.x,
                y: marker.y,
                spatialReference: new SpatialReference({ wkid: 3857 }),
              };
              const graphic = new Graphic({
                geometry: point,
                attributes: marker,
              });
              activeGraphics.push(graphic);
            } else {
              console.log(
                'EMPTY MARKER VALUE - ID: ',
                marker.id,
                'X: ',
                marker.x
              );
            }
          });
          allInActive.forEach((marker) => {
            if (marker.x) {
              const point = {
                type: 'point',
                x: marker.x,
                y: marker.y,
                spatialReference: new SpatialReference({ wkid: 3857 }),
              };
              const graphic = new Graphic({
                geometry: point,
                attributes: marker,
              });
              inactiveGraphics.push(graphic);
            } else {
              console.log(
                'EMPTY MARKER VALUE - ID: ',
                marker.id,
                'X: ',
                marker.x
              );
            }
          });
          if (inactiveGraphics.length > 0) {
            createInactiveMarkerLayer(inactiveGraphics);
          } else {
            console.log('No Inactive markers in this area');
          }
          if (activeGraphics.length > 0) {
            createActiveMarkerLayer(activeGraphics);
          } else {
            console.log('No Active markers in this area');
          }
        }

        //  Creates a client-side FeatureLayer from an array of graphics
        function createActiveMarkerLayer(graphics) {
          window.activeGraphics = graphics;
          //console.log('createActiveMarkerLayer', graphics);
          //https://developers.arcgis.com/javascript/latest/visualization/data-driven-styles/unique-types/
          const markerRenderer = {
            type: 'unique-value',
            field: 'type',
            uniqueValueInfos: [
              {
                value: 'everything',
                label: 'Everything',
                symbol: {
                  type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
                  url: everythingMarkerImage,
                  width: '30px',
                  height: '30px',
                },
              },
              {
                value: 'person',
                label: 'Person',
                symbol: {
                  type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
                  url: peopleMarkerImage,
                  width: '30px',
                  height: '30px',
                },
              },
              {
                value: 'place',
                label: 'Place',
                symbol: {
                  type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
                  url: placeMarkerImage,
                  width: '30px',
                  height: '30px',
                },
              },
              {
                value: 'story',
                label: 'Story',
                symbol: {
                  type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
                  url: storyMarkerImage,
                  width: '30px',
                  height: '30px',
                },
              },
            ],
          };

          const layer = new FeatureLayer({
            id: 'marker_layer_active',
            opacity: 1,
            source: graphics,
            fields: [
              {
                name: 'ObjectID',
                alias: 'ObjectID',
                type: 'oid',
              },
              {
                name: 'id',
                alias: 'ID',
                type: 'string',
              },
              {
                name: 'count',
                alias: 'Count',
                type: 'string',
              },
              {
                name: 'type',
                alias: 'Type',
                type: 'string',
              },
            ],
            geometryType: 'point',
            renderer: markerRenderer,
            popupTemplate: {
              title: '{ID}',
              content: asyncMarkerPopUp,
            },
          });
          addToView(layer);
        }

        //  Creates a client-side FeatureLayer from an array of graphics
        function createInactiveMarkerLayer(graphics) {
          //console.log('createInactiveMarkerLayer', graphics);
          //https://developers.arcgis.com/javascript/latest/visualization/data-driven-styles/unique-types/
          const markerRenderer = {
            type: 'unique-value',
            field: 'type',
            uniqueValueInfos: [
              {
                value: 'everything',
                label: 'Everything',
                symbol: {
                  type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
                  url: everythingMarkerImage,
                  width: '30px',
                  height: '30px',
                },
              },
              {
                value: 'person',
                label: 'Person',
                symbol: {
                  type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
                  url: peopleMarkerImage,
                  width: '30px',
                  height: '30px',
                },
              },
              {
                value: 'place',
                label: 'Place',
                symbol: {
                  type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
                  url: placeMarkerImage,
                  width: '30px',
                  height: '30px',
                },
              },
              {
                value: 'story',
                label: 'Story',
                symbol: {
                  type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
                  url: storyMarkerImage,
                  width: '30px',
                  height: '30px',
                },
              },
            ],
          };

          const layer = new FeatureLayer({
            id: 'marker_layer_inactive',
            opacity: 0.3,
            source: graphics,
            fields: [
              {
                name: 'ObjectID',
                alias: 'ObjectID',
                type: 'oid',
              },
              {
                name: 'id',
                alias: 'ID',
                type: 'string',
              },
              {
                name: 'count',
                alias: 'Count',
                type: 'string',
              },
              {
                name: 'type',
                alias: 'Type',
                type: 'string',
              },
            ],
            geometryType: 'point',
            renderer: markerRenderer,
            popupTemplate: {
              title: '{ID}',
              content: 'Inactive | Count: {Count}',
            },
          });
          addToView(layer);
        }

        // Adds a given layer to the map in the view
        function addToView(layer) {
          //console.log('ADD', layer.id);
          //console.log('CURRENT LAYERS LENGTH', view.map.layers.items.length);
          const ifLayers = view.map.layers.items.length;
          if (ifLayers) {
            const existingLayers = view.map.layers.items;
            const existingLayersIDs = existingLayers.map((layer) => layer.id);
            //console.log('existingLayersIDs', existingLayersIDs);
            existingLayers.forEach(function (item, i) {
              if (layer.id === item.id) {
                view.map.layers.remove(item);
              }
            });
          }

          view.map.add(layer);
          window.kettView = view;
        }
      }
    );
  }, []);

  const asyncPopUp = (target) => {
    const search = document.getElementById('search');
    const dateStart = document.getElementById('navbar-date-start');
    const dateEnd = document.getElementById('navbar-date-end');
    const typeRadio = document.querySelectorAll('.radio-button-input');
    const typeToggle = document.querySelectorAll('.toggle-switch-checkbox');
    let type = 'all';
    let photos = 'false';
    let featured = 'false';
    typeRadio.forEach((el) => {
      if (el.checked) {
        //console.log(el.value);
        type = el.value;
      }
    });
    typeToggle.forEach((el) => {
      if (el.checked) {
        //console.log(el.id);
        photos = el.id === 'photos' ? 'true' : 'false';
        featured = el.id === 'featured' ? 'true' : 'false';
      }
    });
    let filters = {
      search: `${search.value}`,
      id: target.graphic.attributes.id,
      size: '10',
      filters: {
        date_range: `${dateStart.value}-${dateEnd.value}`,
        photos: photos,
        featured: featured,
        type: type,
      },
    };
    return axios
      .post('http://geospatialresearch.mtu.edu/grid_cell.php', filters)
      .then((res) => {
        //console.log('POPUP DATA', res.data);
        const people = res.data.active.people
          ? res.data.active.people.length
          : 0;
        const places = res.data.active.places
          ? res.data.active.places.length
          : 0;
        const stories = res.data.active.stories
          ? res.data.active.stories.length
          : 0;
        const peopleData = res.data.active.people.results;
        const placesData = res.data.active.places.results;
        const storiesData = res.data.active.stories.results;
        const peopleTitles = peopleData.map((person) => person.title);
        const placesTitles = placesData.map((place) => place.title);
        const storiesTitles = storiesData.map((story) => story.title);
        let stringPeople = '';
        let stringPlaces = '';
        let stringStories = '';
        peopleTitles.forEach((title) => {
          stringPeople = stringPeople + `<li>${title}</li>`;
        });
        placesTitles.forEach((title) => {
          stringPlaces = stringPlaces + `<li>${title}</li>`;
        });
        storiesTitles.forEach((title) => {
          stringStories = stringStories + `<li>${title}</li>`;
        });
        //****** */
        // let template = document.createElement('div');
        // let peopleButton = document.createElement('button');
        // let peopleButtonText = document.createTextNode('People');
        // peopleButton.appendChild(peopleButtonText);
        // peopleButton.classList.add('people');
        // template.appendChild(peopleButton);
        //****** */
        // node.addEventListener('click', function () {
        //   console.log('TEST');
        // });
        //****** */
        // let peopleButton = document.createElement('button');
        // let peopleButtonText = document.createTextNode('People');
        // peopleButton.appendChild(peopleButtonText);
        // peopleButton.classList.add('people');
        // template.appendChild(peopleButton);
        //****** */
        // let html =
        //   '<button>People</button><button>Place</button><button>Story</button>';
        // html = html.trim(); // Never return a text node of whitespace as the result
        // template.innerHTML = html;

        // let node = document.createElement('button');
        // node.classList.add('test');
        // let text = document.createTextNode('Test');
        // node.appendChild(text);
        // //let button = document.getElementById('test');
        // node.addEventListener('click', function () {
        //   console.log('TEST');
        // });

        //return template;
        return `
        <div class="grid-popup">
          <div class="grid-popup-tabs">
            <div class="tab tab-people active"><i class="fas fa-user"></i> <span>(${people})</span></div>
            <div class="tab tab-places"><i class="fas fa-building"></i> <span>(${places})</span></div>
            <div class="tab tab-stories"><i class="fas fa-book-open"></i> <span>(${stories})</span></div>
          </div>
          <div class="grid-popup-data">
            <div class="data data-people active">
              <ul>
              ${stringPeople}
              </ul>
            </div>
            <div class="data data-places">
              <ul>
              ${stringPlaces}
              </ul>
            </div>
            <div class="data data-stories">
              <ul>
              ${stringStories}
              </ul>
            </div>
          </div>
        </div>
        `;
      });
  };

  const asyncMarkerPopUp = (target) => {
    const search = document.getElementById('search');
    const dateStart = document.getElementById('navbar-date-start');
    const dateEnd = document.getElementById('navbar-date-end');
    const typeRadio = document.querySelectorAll('.radio-button-input');
    const typeToggle = document.querySelectorAll('.toggle-switch-checkbox');
    let type = 'all';
    let photos = 'false';
    let featured = 'false';
    typeRadio.forEach((el) => {
      if (el.checked) {
        //console.log(el.value);
        type = el.value;
      }
    });
    typeToggle.forEach((el) => {
      if (el.checked) {
        //console.log(el.id);
        photos = el.id === 'photos' ? 'true' : 'false';
        featured = el.id === 'featured' ? 'true' : 'false';
      }
    });
    let filters = {
      search: `${search.value}`,
      id: target.graphic.attributes.id,
      size: '10',
      filters: {
        date_range: `${dateStart.value}-${dateEnd.value}`,
        photos: photos,
        featured: featured,
        type: type,
      },
    };
    return axios
      .post('http://geospatialresearch.mtu.edu/marker_info.php', filters)
      .then((res) => {
        //console.log('POPUP DATA', res.data);
        const people = res.data.active.people
          ? res.data.active.people.length
          : 0;
        const places = res.data.active.places
          ? res.data.active.places.length
          : 0;
        const stories = res.data.active.stories
          ? res.data.active.stories.length
          : 0;
        const peopleData = res.data.active.people.results;
        const placesData = res.data.active.places.results;
        const storiesData = res.data.active.stories.results;
        const peopleTitles = peopleData.map((person) => person.title);
        const placesTitles = placesData.map((place) => place.title);
        const storiesTitles = storiesData.map((story) => story.title);
        let stringPeople = '';
        let stringPlaces = '';
        let stringStories = '';
        peopleTitles.forEach((title) => {
          stringPeople = stringPeople + `<li>${title}</li>`;
        });
        placesTitles.forEach((title) => {
          stringPlaces = stringPlaces + `<li>${title}</li>`;
        });
        storiesTitles.forEach((title) => {
          stringStories = stringStories + `<li>${title}</li>`;
        });
        return `
        <div class="grid-popup">
          <div class="grid-popup-tabs">
            <div class="tab tab-people active"><i class="fas fa-user"></i> <span>(${people})</span></div>
            <div class="tab tab-places"><i class="fas fa-building"></i> <span>(${places})</span></div>
            <div class="tab tab-stories"><i class="fas fa-book-open"></i> <span>(${stories})</span></div>
          </div>
          <div class="grid-popup-data">
            <div class="data data-people active">
              <ul>
              ${stringPeople}
              </ul>
            </div>
            <div class="data data-places">
              <ul>
              ${stringPlaces}
              </ul>
            </div>
            <div class="data data-stories">
              <ul>
              ${stringStories}
              </ul>
            </div>
          </div>
        </div>
        `;
      });
  };

  const asyncGrid = (view, filters, size) => {
    updateLoader('Loading Grid...');
    let ms = 0;
    let timer = setInterval(() => ms++, 1);
    const { search, date_range, photos, featured, type } = filters;
    const payload = {
      search: search,
      size: size,
      filters: {
        date_range: date_range,
        photos: photos,
        featured: featured,
        type: type,
      },
    };
    console.log('asyncGrid', payload);
    return axios
      .post('http://geospatialresearch.mtu.edu/grid4.php', payload)
      .then((res) => {
        clearInterval(timer);
        updateLoader(`Grid Loaded: ${ms}ms`);
        return res.data;
      });
  };
  const asyncMarkers = (view, filters, extent) => {
    console.log('asyncMarkers', filters, extent);
    if (view.zoom > 18) {
      setLoadingMarkers(true);
    }
    const { search, date_range, photos, featured, type } = filters;
    const { xmin, xmax, ymin, ymax } = extent;
    return axios
      .post('http://geospatialresearch.mtu.edu/markers2.php', {
        search: search,
        geometry: {
          xmin: xmin,
          ymin: ymin,
          xmax: xmax,
          ymax: ymax,
          spatialReference: { wkid: 3857 },
        },
        filters: {
          date_range: date_range,
          photos: photos,
          featured: featured,
          type: type,
        },
      })
      .then((res) => {
        setLoadingMarkers(false);
        return res.data;
      });
  };
  const handleTimePeriod = () => {
    window.timePeriod = true;
    setShowTimeChooser(false);
  };
  return (
    <div className="map-wrapper">
      <div className="webmap map" ref={mapRef} />
      <div className="loader">
        <div className="loader-text">{loader}</div>
        <div className="loader-zoom">Zoom: {zoom}</div>
      </div>
      <Chooser show={showTimeChooser} update={handleTimePeriod} />
      {loadingMarkers && <Loader />}
    </div>
  );
}

export default KeTTMap;
