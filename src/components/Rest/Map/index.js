//React
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
//Redux
import { useSelector, useDispatch } from 'react-redux';
import { updateDate } from '../../../redux/reducers/filtersSlice';
import {
  updateMarkers,
  updateListMessage,
} from '../../../redux/reducers/markersSlice';
//ArchGIS
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import Graphic from '@arcgis/core/Graphic';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import TileLayer from '@arcgis/core/layers/TileLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import * as watchUtils from '@arcgis/core/core/watchUtils.js';
//Styles
import './styles.scss';
//Images
import peopleMarkerImage from './images/marker_person.png';
import placeMarkerImage from './images/marker_place.png';
import storyMarkerImage from './images/marker_story.png';
//Functional Component
export const KeTTMap = (props) => {
  const [loader, updateLoader] = useState('Loading Grid...');
  const [zoom, setZoom] = useState(10);
  const [startDate, setStartDate] = useState('1800');
  const [endDate, setEndDate] = useState('2020');
  const [extent, setExtent] = useState({
    xmin: -9907458.148290215,
    xmax: -9787528.450910727,
    ymin: 5915096.725196868,
    ymax: 6008044.151591677,
  });
  const dispatch = useDispatch();
  const mapRef = useRef();

  useEffect(() => {
    dispatch(updateDate(startDate));
    //dispatch(updateLength(length));
  });

  useEffect(() => {
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
        let filters = {
          search: '',
          date_range: '1800-2020',
          photos: 'false',
          featured: 'false',
          type: 'all',
        };
        const { xmin, xmax, ymin, ymax } = view.extent;
        const extent = {
          xmin: xmin,
          xmax: xmax,
          ymin: ymin,
          ymax: ymax,
        };
        updateGrid(view, filters);

        const search = document.getElementById('search');
        const dateSelect = document.querySelectorAll('.esri-select');
        const dateStart = document.getElementById('navbar-date-start');
        const dateEnd = document.getElementById('navbar-date-end');
        const typeRadio = document.querySelectorAll('.radio-button');
        const typeToggle = document.querySelectorAll('.filter-toogle');
        //Search Field Event
        search.addEventListener('change', (event) => {
          event.preventDefault();
          filters = { ...filters, search: `${search.value}` };
          const { xmin, xmax, ymin, ymax } = view.extent;
          const extent = {
            xmin: xmin,
            xmax: xmax,
            ymin: ymin,
            ymax: ymax,
          };
          console.log('SEARCH', filters);
          if (view.zoom <= 16) {
            updateGrid(view, filters);
          }
          asyncMarkers(view, filters, extent).then((res) => {
            //console.log('SEARCH RESPONCE', res.active.people.length);
            dispatch(updateMarkers(res));
            if (view.zoom > 16 && res.active.length) {
              generateMarkers(res.active);
            }
          });
        });
        //Date Change Event
        dateSelect.forEach((el) =>
          el.addEventListener('change', (event) => {
            event.preventDefault();
            setStartDate(dateStart.value);
            filters = {
              ...filters,
              date_range: `${dateStart.value}-${dateEnd.value}`,
            };
            const { xmin, xmax, ymin, ymax } = view.extent;
            const extent = {
              xmin: xmin,
              xmax: xmax,
              ymin: ymin,
              ymax: ymax,
            };
            console.log('DATE CHANGE', filters);
            if (view.zoom <= 16) {
              updateGrid(view, filters);
            }
            asyncMarkers(view, filters, extent).then((res) => {
              //console.log('MARKER DATE RESPONCE', res.active.people.length);
              dispatch(updateMarkers(res));
              if (view.zoom > 16 && res.active.length) {
                generateMarkers(res.active);
              }
            });
          })
        );
        //Radio Change Event
        typeRadio.forEach((el) =>
          el.addEventListener('change', (event) => {
            event.preventDefault();
            filters = { ...filters, type: event.target.value };
            const { xmin, xmax, ymin, ymax } = view.extent;
            const extent = {
              xmin: xmin,
              xmax: xmax,
              ymin: ymin,
              ymax: ymax,
            };
            //console.log('RADIO', filters);
            if (view.zoom <= 16) {
              updateGrid(view, filters);
            }
            asyncMarkers(view, filters, extent).then((res) => {
              //console.log('MARKER DATE RESPONCE', res.active.people.length);
              dispatch(updateMarkers(res));
              if (view.zoom > 16 && res.active.length) {
                generateMarkers(res.active);
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
            const { xmin, xmax, ymin, ymax } = view.extent;
            const extent = {
              xmin: xmin,
              xmax: xmax,
              ymin: ymin,
              ymax: ymax,
            };
            //console.log(event.target.id);
            if (id == 'photos') {
              filters = { ...filters, photos: `${checked}` };
            }
            if (id == 'featured') {
              filters = { ...filters, featured: `${checked}` };
            }
            console.log('TOGGLE', filters);
            if (view.zoom <= 16) {
              updateGrid(view, filters);
            }
            asyncMarkers(view, filters, extent).then((res) => {
              console.log('MARKER DATA RESPONCE', res.active.length);
              dispatch(updateMarkers(res));
              if (view.zoom > 16 && res.active.length) {
                generateMarkers(res.active);
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
        //console.log('GRAPHIC ATTR', graphic.attributes);
      });
    });

    watchUtils.whenTrue(view, 'stationary', function () {
      //console.log('STATIONARY');
      if (view.ready && view.extent) {
        console.log('VIEW EXTENT', view.extent);
        //console.log('VIEW SCALE', view.scale);
        //console.log('VIEW ZOOM', view.zoom);
        setZoom(view.zoom);
        const search = document.getElementById('search');
        const dateStart = document.getElementById('navbar-date-start');
        const dateEnd = document.getElementById('navbar-date-end');
        //document.querySelectorAll('.radio-button');
        const typeRadio = document.querySelector(
          'input[name="filterType"]:checked'
        );
        //console.log('RADIO', typeRadio);
        // const typeRadio = document.querySelector('input[name="filterType"]:checked').value;
        // const typeToggle = document.querySelectorAll('.filter-toogle');
        const { xmin, xmax, ymin, ymax } = view.extent;
        const filters = {
          search: search.value,
          date_range: `${dateStart.value}-${dateEnd.value}`,
          photos: 'false',
          featured: 'false',
          type: typeRadio.value,
        };
        const extent = {
          xmin: xmin,
          xmax: xmax,
          ymin: ymin,
          ymax: ymax,
        };
        setExtent(extent);
        //SHOW HIDE LAYERS
        const layers = view.map.layers;
        if (layers) {
          //console.log('LAYERS', layers.length);
          layers.items.forEach((layer, index) => {
            if (view.zoom <= 10) {
              if (layer.id == 'grid_layer_10') {
                console.log('SHOW', layer.id);
                layer.visible = true;
              }
              if (layer.id == 'grid_layer_1') {
                console.log('HIDE', layer.id);
                layer.visible = false;
              }
              if (layer.id == 'grid_layer_01') {
                console.log('HIDE', layer.id);
                layer.visible = false;
              }
              if (layer.id == 'marker_layer') {
                console.log('HIDE', layer.id);
                layer.visible = false;
              }
            } else if (view.zoom > 10 && view.zoom <= 13) {
              if (layer.id == 'grid_layer_10') {
                console.log('HIDE', layer.id);
                layer.visible = false;
              }
              if (layer.id == 'grid_layer_1') {
                console.log('SHOW', layer.id);
                layer.visible = true;
              }
              if (layer.id == 'grid_layer_01') {
                console.log('HIDE', layer.id);
                layer.visible = false;
              }
              if (layer.id == 'marker_layer') {
                console.log('HIDE', layer.id);
                layer.visible = false;
              }
            } else if (view.zoom > 13 && view.zoom <= 16) {
              if (layer.id == 'grid_layer_10') {
                console.log('HIDE', layer.id);
                layer.visible = false;
              }
              if (layer.id == 'grid_layer_1') {
                console.log('HIDE', layer.id);
                layer.visible = false;
              }
              if (layer.id == 'grid_layer_01') {
                console.log('SHOW', layer.id);
                layer.visible = true;
              }
              if (layer.id == 'marker_layer') {
                console.log('HIDE', layer.id);
                layer.visible = false;
              }
            } else if (view.zoom > 16) {
              if (layer.id == 'grid_layer_10') {
                console.log('HIDE', layer.id);
                layer.visible = false;
              }
              if (layer.id == 'grid_layer_1') {
                console.log('HIDE', layer.id);
                layer.visible = false;
              }
              if (layer.id == 'grid_layer_01') {
                console.log('HIDE', layer.id);
                layer.visible = false;
              }
              if (layer.id == 'marker_layer') {
                console.log('SHOW', layer.id);
                layer.visible = true;
              }
            }
          });
        }
        //LOAD MARKERS
        asyncMarkers(view, filters, extent).then((res) => {
          console.log('MARKER RESPONCE', res.active);
          dispatch(updateMarkers(res));
          if (view.zoom > 16 && res.active.length) {
            generateMarkers(res.active);
          }
        });
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
      if (gridGraphics.length) {
        //console.log('GRID GRAPHICS', gridGraphics);
        createGridLayer(gridGraphics, size);
      }
    }

    function generateGridInactive(cells) {
      const gridActive = cells.results;
      const gridGraphics = [];
      gridActive.forEach((cell) => {
        if (cell.centroid.lon) {
          const point = {
            type: 'point',
            x: cell.centroid.lon,
            y: cell.centroid.lat,
            spatialReference: new SpatialReference({ wkid: 3857 }),
          };
          const cellGraphic = new Graphic({
            geometry: point,
            attributes: cell,
          });
          gridGraphics.push(cellGraphic);
        } else {
          console.log(
            'EMPTY INACTIVE GRID VALUE - ID: ',
            cell.id,
            'X: ',
            cell.centroid.lon
          );
        }
      });
      if (gridGraphics.length) {
        //console.log('GRID GRAPHICS INACTIVE', gridGraphics);
        createGridLayerInactive(gridGraphics);
      }
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
                expression: '($feature.radius * 577790.554289 / $view.scale)',
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
                expression: `
                        var outerSize = $feature.radius * 577790.554289 / $view.scale;
                        var innerSizeMin = outerSize * 0.3;
                        var innerSize = outerSize * $feature.percent;
                        return innerSize;
                      `,
                returnType: 'Default',
              },
            },
          ],
        },
      };
      const show = size == '10' ? true : false;
      const grid = new FeatureLayer({
        id: `grid_layer_${size}`,
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
            name: 'percent',
            alias: 'Percent',
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
          title: 'ACTIVE | {id} | {percent} | {type}',
          content: asyncPopUp,
        },
      });
      addToView(grid);
    }

    function createGridLayerInactive(graphics) {
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
                          color: [71, 71, 71],
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
                expression: '56 * 577790 / $view.scale',
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
                      var outerSize = 56 * 577790 / $view.scale;
                      var innerSizeMin = outerSize * 0.3;
                      var innerSize = outerSize * $feature.percent;
                      return IIF( innerSize < 3, innerSizeMin, innerSize-2 );
                    `,
                returnType: 'Default',
              },
            },
          ],
        },
      };

      const grid = new FeatureLayer({
        id: 'grid_inactive_layer',
        source: graphics,
        opacity: 0.3,
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
            name: 'percent',
            alias: 'Percent',
            type: 'string',
          },
          {
            name: 'type',
            alias: 'Type',
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
                  color: [64, 132, 130],
                },
                {
                  value: 2,
                  color: [204, 97, 49],
                },
                {
                  value: 3,
                  color: [154, 98, 181],
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
          title: 'INACTIVE | {id} | {percent} | {type}',
          content: asyncPopUp,
        },
      });
      //console.log('GRID INACTIVE', grid);
      addToView(grid);
    }

    function generateMarkers(markers) {
      //console.log('generateMarkers', markers);
      const peopleActive = markers.people ? markers.people.results : [];
      const placesActive = markers.places ? markers.places.results : [];
      const storiesActive = markers.stories ? markers.stories.results : [];
      const allActive = [...peopleActive, ...placesActive, ...storiesActive];
      //console.log('allActive', allActive);
      const graphics = [];
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
          graphics.push(graphic);
        } else {
          console.log('EMPTY MARKER VALUE - ID: ', marker.id, 'X: ', marker.x);
        }
      });
      if (graphics.length) {
        createMarkerLayer(graphics);
      } else {
        console.log('No markers in this area');
      }
    }

    //  Creates a client-side FeatureLayer from an array of graphics
    function createMarkerLayer(graphics) {
      console.log('createMarkerLayer', graphics);
      //https://developers.arcgis.com/javascript/latest/visualization/data-driven-styles/unique-types/
      const markerRenderer = {
        type: 'unique-value',
        field: 'type',
        uniqueValueInfos: [
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
        id: 'marker_layer',
        source: graphics,
        fields: [
          {
            name: 'ObjectID',
            alias: 'ObjectID',
            type: 'oid',
          },
          {
            name: 'recnumber',
            alias: 'RecNum',
            type: 'string',
          },
          {
            name: 'title',
            alias: 'Title',
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
          title: '{Title}',
        },
      });
      addToView(layer);
    }

    // Adds a given layer to the map in the view
    function addToView(layer) {
      console.log('ADD', layer.id);
      console.log('CURRENT LAYERS LENGTH', view.map.layers.items.length);
      const ifLayers = view.map.layers.items.length;
      if (ifLayers) {
        const existingLayers = view.map.layers.items;
        const existingLayersIDs = existingLayers.map((layer) => layer.id);
        console.log('existingLayersIDs', existingLayersIDs);
        existingLayers.forEach(function (item, i) {
          if (layer.id == item.id) {
            view.map.layers.remove(item);
          }
        });
      }

      view.map.add(layer);
    }
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
        photos = el.id == 'photos' ? 'true' : 'false';
        featured = el.id == 'featured' ? 'true' : 'false';
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
    dispatch(updateListMessage('Loading List...'));
    let ms = 0;
    let timer = setInterval(() => ms++, 1);
    console.log('asyncMarkers', filters);
    //console.log('asyncMarkers', extent);
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
        clearInterval(timer);
        //updateLoader(`Markers Loaded: ${ms}ms`);
        dispatch(updateListMessage(`List Loaded: ${ms}ms`));
        return res.data;
      });
  };
  return (
    <div className="map-wrapper">
      <div className="webmap map" ref={mapRef} />
      <div className="loader">
        <div className="loader-text">{loader}</div>
        <div className="loader-zoom">Zoom: {zoom}</div>
      </div>
    </div>
  );
};
