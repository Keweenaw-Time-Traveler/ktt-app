//React
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import $ from 'jquery';
//Redux
import { useSelector, useDispatch } from 'react-redux';
import { getPlaceName } from '../../../redux/reducers/filtersSlice';
import {
  selectTimeline,
  updateTimelineRange,
} from '../../../redux/reducers/timelineSlice';
//Components
import Loader from './Loader';
import Chooser from './Chooser';
//ArchGIS
import { loadModules } from 'esri-loader';
//Styles
import './styles.scss';
//Images
import everythingMarkerImage from './images/marker_everything.png';
import peopleMarkerImage from './images/marker_person.png';
import placeMarkerImage from './images/marker_place.png';
import storyMarkerImage from './images/marker_story.png';
//Functional Component
function KeTTMap() {
  const dispatch = useDispatch();
  const [zoom, setZoom] = useState(10);
  const [loadingMarkers, setLoadingMarkers] = useState(false);
  const [showTimeChooser, setShowTimeChooser] = useState(false);
  const mapRef = useRef();
  const searchRef = useRef('');
  const dateRangeRef = useRef('1875-2021');
  const startDateRef = useRef('1800');
  const endDateRef = useRef('2020');
  const typeRef = useRef('everything');
  const photosRef = useRef('false');
  const featuredRef = useRef('false');
  const tileUrlRef = useRef('');

  useEffect(() => {
    loadModules(
      [
        'esri/Map',
        'esri/views/MapView',
        'esri/Basemap',
        'esri/layers/VectorTileLayer',
        'esri/layers/TileLayer',
        'esri/layers/FeatureLayer',
        'esri/Graphic',
        'esri/geometry/SpatialReference',
        'esri/core/watchUtils',
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
        Graphic,
        SpatialReference,
        watchUtils,
      ]) => {
        //console.log('STATE LIST VALUE', listValue);

        const startingExtent = {
          xmax: -9700657.768264594,
          xmin: -9994328.830936352,
          ymax: 6050160.9541768255,
          ymin: 5872979.92261172,
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
            window.markerExtent = null; //Used to determine if markers need to be updated, see watchUtils.whenTrue below
            window.timePeriod = null; //Used to determine if time period needs to be chosen, see watchUtils.whenTrue below

            const startingFilters = {
              search: '',
              date_range: '1875-2021',
              startDate: '1875',
              endDate: '2021',
              location: 'Keweenaw',
              photos: 'false',
              featured: 'false',
              type: 'everything',
            };
            updateGrid(view, startingFilters);

            //Choose a Time Popup Change Event
            $('#time-chooser-select').on('change', function (e) {
              e.preventDefault();
              const $selected = $(this).find(':selected');
              const min = $selected.data('min');
              const max = $selected.data('max');
              const url = $selected.data('url');
              dateRangeRef.current = `${min}-${max}`;
              startDateRef.current = `${min}`;
              endDateRef.current = `${max}`;
              tileUrlRef.current = url;
              const filterVal = {
                search: searchRef.current,
                date_range: `${min}-${max}`,
                photos: photosRef.current,
                featured: featuredRef.current,
                type: typeRef.current,
              };
              const extentClone = view.extent.clone();
              const extentExpanded = extentClone.expand(10);
              const { xmin, xmax, ymin, ymax } = extentExpanded;
              const extent = {
                xmin: xmin,
                xmax: xmax,
                ymin: ymin,
                ymax: ymax,
              };
              console.log('TIME CHOOSER CHANGE', filterVal);
              dispatch(updateTimelineRange(`${min}-${max}`));
              //UPDATE GRID
              updateGrid(view, filterVal);
              //LOAD MARKERS
              asyncMarkers(view, filterVal, extent).then((res) => {
                console.log('MARKER RESPONCE', res);
                generateMarkers(view, res);
              });
              //ADD TILE LAYER
              createTileLayer(view.zoom, url);
            });
            //Timeline Segment Click Event
            $('.segment').on('click', function (e) {
              const min = $(this).data('min');
              const max = $(this).data('max');
              const url = $(this).data('url');
              dateRangeRef.current = `${min}-${max}`;
              startDateRef.current = `${min}`;
              endDateRef.current = `${max}`;
              tileUrlRef.current = url;
              const filterVal = {
                search: searchRef.current,
                date_range: `${min}-${max}`,
                photos: photosRef.current,
                featured: featuredRef.current,
                type: typeRef.current,
              };
              const extentClone = view.extent.clone();
              const extentExpanded = extentClone.expand(10);
              const { xmin, xmax, ymin, ymax } = extentExpanded;
              const extent = {
                xmin: xmin,
                xmax: xmax,
                ymin: ymin,
                ymax: ymax,
              };
              console.log('TIME SEGMENT CHOOSEN', filterVal);
              dispatch(updateTimelineRange(`${min}-${max}`));
              handleTimePeriod();
              //ADD TILE LAYER
              createTileLayer(view.zoom, url);
              //UPDATE GRID
              updateGrid(view, filterVal);
              //LOAD MARKERS
              asyncMarkers(view, filterVal, extent).then((res) => {
                console.log('MARKER RESPONCE', res);
                generateMarkers(view, res);
              });
            });
            //Timeline Reset Click Event
            $('.navbar-middle').on('click', '.timeline-reset', function () {
              //console.log('TIMELINE', timeline);
              const min = '1875';
              const max = '2021';
              const url = '';
              dateRangeRef.current = `${min}-${max}`;
              startDateRef.current = `${min}`;
              endDateRef.current = `${max}`;
              tileUrlRef.current = url;
              const filterVal = {
                search: searchRef.current,
                date_range: `${min}-${max}`,
                photos: photosRef.current,
                featured: featuredRef.current,
                type: typeRef.current,
              };
              const extentClone = view.extent.clone();
              const extentExpanded = extentClone.expand(10);
              const { xmin, xmax, ymin, ymax } = extentExpanded;
              const extent = {
                xmin: xmin,
                xmax: xmax,
                ymin: ymin,
                ymax: ymax,
              };
              console.log('TIMELINE RESET', filterVal);
              dispatch(updateTimelineRange(`${min}-${max}`));
              handleTimePeriod();
              //ADD TILE LAYER
              createTileLayer(view.zoom, url);
              //UPDATE GRID
              updateGrid(view, filterVal);
              //LOAD MARKERS
              asyncMarkers(view, filterVal, extent).then((res) => {
                console.log('MARKER RESPONCE', res);
                generateMarkers(view, res);
              });
            });
            //Landing Page Search Button Click Event
            $('#intro-options-search-icon').on('click', function (e) {
              e.preventDefault();
              const searchValue = $('#search-landing').val();
              searchRef.current = `${searchValue}`;
              const filterVal = {
                search: `${searchValue}`,
                date_range: dateRangeRef.current,
                photos: photosRef.current,
                featured: featuredRef.current,
                type: typeRef.current,
              };
              console.log('LANDING BUTTON CLICKED', filterVal);
              updateGrid(view, filterVal);
            });
            //Main Search Field Click Event
            $('#search-icon').on('click', function (e) {
              e.preventDefault();
              const searchValue = $('#search').val();
              searchRef.current = `${searchValue}`;
              const filterVal = {
                search: `${searchValue}`,
                date_range: dateRangeRef.current,
                photos: photosRef.current,
                featured: featuredRef.current,
                type: typeRef.current,
              };
              const extentClone = view.extent.clone();
              const extentExpanded = extentClone.expand(10);
              const { xmin, xmax, ymin, ymax } = extentExpanded;
              const extent = {
                xmin: xmin,
                xmax: xmax,
                ymin: ymin,
                ymax: ymax,
              };
              console.log('SEARCH CHANGE', filterVal);
              //UPDATE GRID
              updateGrid(view, filterVal);
              //LOAD MARKERS
              if (searchValue != '') {
                asyncMarkers(view, filterVal, extent).then((res) => {
                  console.log('MARKER RESPONCE', res);
                  generateMarkers(view, res);
                });
              }
              //MAKE SURE TILES ARE HIDDEN
              hideLayer('title_layer', view.map.layers);
              //RESET EXTENTS
              view.goTo(
                {
                  zoom: 10,
                },
                {
                  duration: 5000,
                }
              );
            });
            //Filters:Radio Buttons Click Event
            $('.radio-button-input').on('click', function () {
              const type = $(this).val();
              typeRef.current = `${type}`;
              const filterVal = {
                search: searchRef.current,
                date_range: dateRangeRef.current,
                photos: photosRef.current,
                featured: featuredRef.current,
                type: `${type}`,
              };
              const { xmin, xmax, ymin, ymax } = view.extent;
              const extent = {
                xmin: xmin,
                xmax: xmax,
                ymin: ymin,
                ymax: ymax,
              };
              //UPDATE GRID
              updateGrid(view, filterVal);
              //LOAD MARKERS
              asyncMarkers(view, filterVal, extent).then((res) => {
                console.log('MARKER RESPONCE', res);
                generateMarkers(view, res);
              });
            });
            //Filters:Checkbox Click Event
            $('.toggle-switch-checkbox').on('click', function () {
              const type = $(this).data('type');
              const checked = $(this).is(':checked');
              let filterVal = {};
              const { xmin, xmax, ymin, ymax } = view.extent;
              const extent = {
                xmin: xmin,
                xmax: xmax,
                ymin: ymin,
                ymax: ymax,
              };
              if (type === 'photos') {
                photosRef.current = `${checked}`;
                filterVal = {
                  search: searchRef.current,
                  date_range: dateRangeRef.current,
                  photos: `${checked}`,
                  featured: featuredRef.current,
                  type: typeRef.current,
                };
              }
              if (type === 'featured') {
                featuredRef.current = `${checked}`;
                filterVal = {
                  search: searchRef.current,
                  date_range: dateRangeRef.current,
                  photos: photosRef.current,
                  featured: `${checked}`,
                  type: typeRef.current,
                };
              }
              console.log('TOGGLE', filterVal);
              //UPDATE GRID
              updateGrid(view, filterVal);
              //LOAD MARKERS
              asyncMarkers(view, filterVal, extent).then((res) => {
                console.log('MARKER RESPONCE', res);
                generateMarkers(view, res);
              });
            });
            //List Item Click Event
            $('.page-content').on('click', '.list-results-item', (e) => {
              //const data = $(this).attr('class');
              const itemId = $(e.target).data('id');
              const itemTitle = $(e.target).attr('title');
              const point = {
                type: 'point',
                x: '-9841478.19616046',
                y: '5974102.13086827',
                spatialReference: new SpatialReference({ wkid: 3857 }),
              };

              view
                .goTo(
                  {
                    target: point,
                    zoom: 19,
                  },
                  {
                    duration: 5000,
                  }
                )
                .then(() => {
                  view.popup.open({
                    title: `Item ID: ${itemId}`,
                    location: view.center,
                  });
                  view.popup.content = `Title: ${itemTitle}`;
                });
            });
          })
          .catch(function (e) {
            console.error('Creating FeatureLayer failed', e);
          });

        view.on('click', function (event) {
          console.log(event.mapPoint);
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
            dispatch(
              getPlaceName({
                xmin: view.extent.xmin,
                ymin: view.extent.ymin,
                xmax: view.extent.xmax,
                ymax: view.extent.ymax,
                spatialReference: { wkid: 3857 },
              })
            );
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
                window.markerExtent = extentClone.expand(10);
              }

              const isInside = window.markerExtent.contains(extentClone);
              console.log('Is inside', isInside);

              //LOAD MARKERS
              if (!isInside) {
                const expanded = view.extent.clone().expand(10);
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
                  generateMarkers(view, res);
                });
              }
            }
            //SHOW HIDE LAYERS
            const layers = view.map.layers;
            if (layers) {
              //console.log('LAYERS', layers.length);
              const level_1 = '6';
              const level_2 = '1';
              const level_3 = '01';
              const level_4 = '008';
              layers.items.forEach((layer, index) => {
                if (view.zoom <= 10) {
                  if (layer.id === `grid_layer_${level_1}`) {
                    console.log('SHOW', layer.id);
                    layer.visible = true;
                  }
                  if (layer.id === `grid_layer_${level_2}`) {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (layer.id === `grid_layer_${level_3}`) {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (layer.id === `grid_layer_${level_4}`) {
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
                  if (layer.id === `grid_layer_${level_1}`) {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (layer.id === `grid_layer_${level_2}`) {
                    console.log('SHOW', layer.id);
                    layer.visible = true;
                  }
                  if (layer.id === `grid_layer_${level_3}`) {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (layer.id === `grid_layer_${level_4}`) {
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
                } else if (view.zoom > 13 && view.zoom <= 16) {
                  if (layer.id === `grid_layer_${level_1}`) {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (layer.id === `grid_layer_${level_2}`) {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (layer.id === `grid_layer_${level_3}`) {
                    console.log('SHOW', layer.id);
                    layer.visible = true;
                  }
                  if (layer.id === `grid_layer_${level_4}`) {
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
                } else if (view.zoom > 16 && view.zoom <= 18) {
                  if (layer.id === `grid_layer_${level_1}`) {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (layer.id === `grid_layer_${level_2}`) {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (layer.id === `grid_layer_${level_3}`) {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (layer.id === `grid_layer_${level_4}`) {
                    console.log('SHOW', layer.id);
                    layer.visible = true;
                  }
                  if (
                    layer.id === 'marker_layer_active' ||
                    layer.id === 'marker_layer_inactive' ||
                    layer.id === 'title_layer'
                  ) {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                } else if (view.zoom > 18) {
                  if (layer.id === `grid_layer_${level_1}`) {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (layer.id === `grid_layer_${level_2}`) {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (layer.id === `grid_layer_${level_3}`) {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (layer.id === `grid_layer_${level_4}`) {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (
                    layer.id === 'marker_layer_active' ||
                    layer.id === 'marker_layer_inactive' ||
                    layer.id === 'title_layer'
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
          //GRID LEVEL 1
          asyncGrid(filters, '6').then((res) => {
            console.log('GRID LEVEL 1 RESPONCE', res);
            //generateGridInactive(res.inactive);
            generateGrid(view, res.active, filters.type, '6', '28');
          });
          //GRID LEVEL 2
          asyncGrid(filters, '1').then((res) => {
            console.log('GRID LEVEL 2 RESPONCE', res);
            //generateGridInactive(res.inactive);
            generateGrid(view, res.active, filters.type, '1', '4');
          });
          //GRID LEVEL 3
          asyncGrid(filters, '0.1').then((res) => {
            console.log('GRID LEVEL 3 RESPONCE', res);
            //generateGridInactive(res.inactive);
            generateGrid(view, res.active, filters.type, '01', '0.4');
          });
          //GRID LEVEL 4
          asyncGrid(filters, '0.05').then((res) => {
            console.log('GRID LEVEL 4 RESPONCE', res);
            //generateGridInactive(res.inactive);
            generateGrid(view, res.active, filters.type, '008', '0.2');
          });
        }

        function generateGrid(view, cells, type, size, radius) {
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
          createGridLayer(view, gridGraphics, type, size);
        }

        function createGridLayer(view, graphics, type, size) {
          let gridColor = [0, 0, 0, 255];
          switch (type) {
            case 'people':
              gridColor = [64, 132, 130, 255];
              break;
            case 'places':
              gridColor = [154, 98, 181, 255];
              break;
            case 'stories':
              gridColor = [204, 97, 49, 255];
              break;
          }
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
                              color: gridColor,
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
                              color: gridColor,
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
          let show = false;
          if (size === '6' && view.zoom <= 10) {
            show = true;
          } else if (size === '1' && view.zoom > 10 && view.zoom <= 13) {
            show = true;
          } else if (size === '01' && view.zoom > 13 && view.zoom <= 16) {
            show = true;
          } else if (size === '008' && view.zoom > 16 && view.zoom <= 18) {
            show = true;
          } else if (view.zoom > 18) {
            show = false;
          }
          console.log('SHOW', show);
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
            },
            popupTemplate: {
              title: 'ACTIVE | {id} | {montenum} | {type}',
              content: asyncPopUp,
            },
          });
          addToView(grid);
        }

        function generateMarkers(view, markers) {
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
            createInactiveMarkerLayer(view, inactiveGraphics);
          } else {
            console.log('No Inactive markers in this area');
          }
          if (activeGraphics.length > 0) {
            createActiveMarkerLayer(view, activeGraphics);
          } else {
            console.log('No Active markers in this area');
          }
        }

        //  Creates a client-side FeatureLayer from an array of graphics
        function createActiveMarkerLayer(view, graphics) {
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
          const show = view.zoom > 18 ? true : false;
          const layer = new FeatureLayer({
            id: 'marker_layer_active',
            opacity: 1,
            visible: show,
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
        function createInactiveMarkerLayer(view, graphics) {
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
          const show = view.zoom > 18 ? true : false;
          const layer = new FeatureLayer({
            id: 'marker_layer_inactive',
            opacity: 0.3,
            visible: show,
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

        function createTileLayer(zoom, url) {
          const show = zoom > 18 ? true : false;
          const tileLayer = new TileLayer({
            id: 'title_layer',
            url,
            visible: show,
          });
          addToView(tileLayer);
        }

        function hideLayer(id, layers) {
          layers.items.forEach((layer, index) => {
            if (layer.id === id) {
              layer.visible = false;
            }
          });
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

  const asyncGrid = (filters, size) => {
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
      .post('http://geospatialresearch.mtu.edu/grid.php', payload)
      .then((res) => {
        clearInterval(timer);
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
      .post('http://geospatialresearch.mtu.edu/markers.php', {
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
        <div className="loader-zoom">Zoom: {zoom}</div>
      </div>
      <Chooser show={showTimeChooser} update={handleTimePeriod} />
      {loadingMarkers && <Loader />}
    </div>
  );
}

export default KeTTMap;
