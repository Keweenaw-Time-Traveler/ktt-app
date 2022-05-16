//React
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import $ from 'jquery';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  getPlaceName,
  updateDateRange,
  updateStartDate,
  updateEndDate,
  updateSearch,
  updateHide,
} from '../../../redux/reducers/filtersSlice';
import {
  updateTimelineRange,
  updateActiveSegment,
  updateActiveUrl,
  updateLeftPip,
  updateRightPip,
  updateReset,
} from '../../../redux/reducers/timelineSlice';
import {
  getList,
  toggleList,
  updateListItem,
} from '../../../redux/reducers/listSlice';
import {
  getDetails,
  toggleDetails,
  selectShowDetails,
} from '../../../redux/reducers/detailsSlice';
import { toggleSubmit } from '../../../redux/reducers/submitSlice';
//Components
import Loader from './Loader';
import Chooser from './Chooser';
//Modules
import { mapPickerList } from './modules/mapPicker';
//Utilities
import { getUrlVariable } from '../../../util/getUrlVariable';
//ArchGIS
import { loadModules } from 'esri-loader';
//Styles
import './styles.scss';
//Images
import everythingMarkerImage from './images/marker_everything.png';
import peopleMarkerImage from './images/marker_person.png';
import placeMarkerImage from './images/marker_place.png';
import storyMarkerImage from './images/marker_story.png';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faQuestion } from '@fortawesome/pro-solid-svg-icons';
//Functional Component
function KeTTMap() {
  const dispatch = useDispatch();
  const [loadingMarkers, setLoadingMarkers] = useState(false);
  const [showTimeChooser, setShowTimeChooser] = useState(false);
  const mapRef = useRef();
  const searchRef = useRef('');
  const dateRangeRef = useRef('1850-2021');
  const startDateRef = useRef('1850');
  const endDateRef = useRef('2021');
  const typeRef = useRef('everything');
  const photosRef = useRef('false');
  const featuredRef = useRef('false');
  const tileUrlRef = useRef('');
  const activeMarkerRecnumberRef = useRef('');
  const activeMarkerIdRef = useRef('');
  const activeMarkerLoctypeRef = useRef('');
  const activeMarkerTypeRef = useRef('');
  const markersLoadedRef = useRef(false);
  const inactiveStatus = useRef(false);
  const hideMode = useRef(false);

  //Sets the zoom level where the map transitions from Grid to Markers
  const gridZoom1 = 10;
  const gridZoom2 = 13;
  const gridZoom3 = 16;
  const gridThreshold = 17;
  const inactiveThreshold = 17;
  const asyncMarkersPadding = 3;

  //Sets the different grid sizes
  const level_1 = '6';
  const level_2 = '1';
  const level_3 = '0.1';
  const level_4 = '0.05';

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
        'esri/geometry/Point',
        'esri/widgets/Slider',
        'esri/widgets/Expand',
        'esri/widgets/BasemapToggle',
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
        Point,
        Slider,
        Expand,
        BasemapToggle,
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

        //Share a Story
        $('#share-story')
          .delay(2000)
          .css('opacity', '1')
          .on('click', function () {
            dispatch(toggleSubmit('show'));
          });
        //Get Help
        $('#explorer-help')
          .delay(2000)
          .css('opacity', '1')
          .on('click', function () {});

        //Map UI
        const opacitySlider = new Slider({
          view,
          min: 0,
          max: 100,
          values: [100],
          steps: 1,
          snapOnClickEnabled: false,
          layout: 'vertical',
          visibleElements: {
            labels: false,
            rangeLabels: true,
          },
        });
        opacitySlider.on(['thumb-change', 'thumb-drag'], updateOpacity);
        const basemapToggle = new BasemapToggle({
          view,
          nextBasemap: 'satellite',
        });
        const mapPickerExpand = new Expand({
          view,
          expandIconClass: 'esri-icon-collection',
          content: 'loading...',
          expandTooltip: 'Map Overlays',
          group: 'top-right',
        });
        view.ui.add([mapPickerExpand, opacitySlider], 'top-right');
        view.ui.move({
          component: 'zoom',
          position: 'top-right',
        });
        view.ui.add('share-help', 'bottom-right');
        mapPickerExpand.when().then(function (picker) {
          mapPickerList().then((res) => {
            picker.content = res;
          });
        });
        view
          .when()
          .then(() => {
            window.markerExtent = null; //Used to determine if markers need to be updated, see watchUtils.whenTrue below
            window.timePeriod = null; //Used to determine if time period needs to be chosen, see watchUtils.whenTrue below
            const min = $('#date-range .label-min').text();
            const max = $('#date-range .label-max').text();
            const startingFilters = {
              search: '',
              date_range: `${min}-${max}`,
              startDate: `${min}`,
              endDate: `${max}`,
              location: 'Keweenaw',
              photos: 'false',
              featured: 'false',
              type: 'everything',
            };

            // Get any parameters in the URL
            // http://localhost:3000/?id=F18C3368-DB7B-4ADC-A3DB-58E3E2B086D1&recnumber=14225680CENSUS1930&loctype=Home&title=Fred%20J%20Lightfoot,%2037,%20Home&mapyear=1930&x=-9860782.7233&y=5961296.5271&markerid=-9860782.7233|5961296.5271&type=people
            const paramId = getUrlVariable('id');
            const paramRecnumber = getUrlVariable('recnumber');
            const paramLoctype = getUrlVariable('loctype');
            const paramTitle = getUrlVariable('title');
            const paramTitleDecoded = decodeURI(paramTitle);
            const paramMapyear = getUrlVariable('mapyear');
            const paramX = getUrlVariable('x');
            const paramY = getUrlVariable('y');
            const paramPoint = new Point({
              x: paramX,
              y: paramY,
              spatialReference: { wkid: 3857 },
            });
            const paramMarkerId = getUrlVariable('markerid');
            const paramType = getUrlVariable('type');

            if (
              paramId &&
              paramRecnumber &&
              paramLoctype &&
              paramTitle &&
              paramX &&
              paramY &&
              paramMarkerId &&
              paramType
            ) {
              handleTimePeriod();
              searchRef.current = paramTitleDecoded;
              loadDetails(
                paramId,
                paramRecnumber,
                paramLoctype,
                paramTitleDecoded
              );
              updateTimeline(paramMapyear);
              gotoMarker(
                paramPoint,
                paramId,
                paramRecnumber,
                paramMarkerId,
                paramLoctype,
                paramType
              );
              dispatch(toggleList('hide'));
            }

            updateGrid(view, startingFilters);

            //Landing Page Explore Button
            $('body').on('click', '.intro-options-explore', function (e) {
              console.log('EXPLORE BUTTON');
              e.preventDefault();
              let newExtent = undefined;
              view.map.layers.items.forEach((layer, index) => {
                if (layer.id === 'grid_layer_6') {
                  console.log('LAYER ID', layer);
                  newExtent = layer.fullExtent;
                }
              });
              view.goTo(newExtent, { duration: 3000 });
            });
            //Map Overlay Picker List Item Click Event
            $('.page-content').on(
              'click',
              '.main-map-picker .overlay',
              function () {
                const min = $(this).find('span.min').text();
                const max = $(this).find('span.max').text();
                const left = $(this).find('span.left').text();
                const right = $(this).find('span.right').text();
                const url = $(this).find('span.url').text();
                const segmentId = $(`.segment[data-min=${min}]`).data('id');
                dateChange(min, max, url);
                createTileLayer({ url, zoom: false });
                handleTimePeriod();
                //SET ACTIVE LIST ITEM
                $(this).parent().find('li').removeClass('active');
                $(this).addClass('active');
                //UPDATE TIMELINE
                dispatch(updateActiveSegment(`${segmentId}`));
                dispatch(updateLeftPip(left));
                dispatch(updateRightPip(right));
                dispatch(updateDateRange(`${min}-${max}`));
                dispatch(updateStartDate(`${min}`));
                dispatch(updateEndDate(`${max}`));
                dispatch(updateReset(true));
                dispatch(getList({}));
              }
            );
            //Basemap Picker List Item Click Event
            $('body').on('click', '.main-map-picker .basemap', function () {
              //console.log('MAP PICKER');
              //SET ACTIVE LIST ITEM
              $(this).parent().find('li').removeClass('active');
              $(this).addClass('active');
              //SET BASEMAP
              const type = $(this).find('span').attr('class');
              if (type === 'default')
                return (view.map.basemap = modern_antique);
              if (type === 'topo') return (view.map.basemap = 'topo-vector');
              if (type === 'terrain') return (view.map.basemap = 'terrain');
              if (type === 'satalite') return (view.map.basemap = 'satellite');
            });
            //"Choose a Time" Popup Change Event
            $('#time-chooser-select').on('change', function (e) {
              e.preventDefault();
              const $selected = $(this).find(':selected');
              const min = $selected.data('min');
              const max = $selected.data('max');
              const url = $selected.data('url');
              //const zoom = view.zoom < gridZoom1 ? true : false;
              console.log('TIME CHOOSER', { min, max, url });
              dateChange(min, max, url);
              createTileLayer({ url });
            });
            //Timeline Segment Click Event
            $('.segment').on('click', function (e) {
              const id = $(this).data('id');
              moveThroughTime(id);
            });
            //Timeline Reset Click Event
            $('.navbar-middle').on('click', '.timeline-reset', function () {
              resetMap();
            });
            //Landing Page Search Field Events
            $('body').on('click', '#intro-options-search-icon', function (e) {
              e.preventDefault();
              landingSearch();
            });
            $('body').on('keydown', '#search-landing', function (e) {
              if (e.key === 'Enter') {
                landingSearch();
              }
            });
            //Main Search Field Click Event
            $('#search-icon').on('click', function (e) {
              e.preventDefault();
              mainSearch();
            });
            $('#search').on('keydown', function (e) {
              if (e.key === 'Enter') {
                mainSearch();
              }
            });
            $('body').on('click', '#search-clear', function () {
              console.log('SEARCH FOO');
              mainSearch('clear');
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
              //CLEAR POPUP
              view.popup.close();
              //UPDATE GRID
              updateGrid(view, filterVal);
              //LOAD MARKERS
              if (view.zoom > gridThreshold) {
                let inactive = 'false';
                if (view.zoom > inactiveThreshold) {
                  inactive = 'true';
                }
                asyncMarkers(view, filterVal, inactive, extent).then((res) => {
                  console.log('MARKER RESPONCE', res);
                  generateMarkers(view, res);
                });
              }
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
              //CLEAR POPUP
              if (type !== 'hide') {
                view.popup.close();
              }
              //UPDATE GRID
              if (type !== 'hide') {
                updateGrid(view, filterVal);
              }
              //LOAD MARKERS
              if (view.zoom > gridThreshold && type !== 'hide') {
                let inactive = 'false';
                if (view.zoom > inactiveThreshold) {
                  inactive = 'true';
                }
                asyncMarkers(view, filterVal, inactive, extent).then((res) => {
                  console.log('MARKER RESPONCE', res);
                  generateMarkers(view, res);
                });
              }
              //Hide Markers
              if (type === 'hide') {
                const hideChecked = !$(this).is(':checked');
                hideMarkers(hideChecked);
              }
            });
            //List Item Click Event
            $('.page-content').on('click', '.list-results-item', function () {
              listClick($(this));
            });
            //Related Content List Item Click
            $('.page-content').on('click', '.related-data-item', function () {
              listClick($(this));
              // Update map in background
              const searchValue = $(this).text();
              const min = $('#date-range .label-min').text();
              const max = $('#date-range .label-max').text();
              searchRef.current = `${searchValue}`;
              dateRangeRef.current = `${min}-${max}`;
              startDateRef.current = `${min}`;
              endDateRef.current = `${max}`;
              const filterVal = {
                search: `${searchValue}`,
                date_range: `${min}-${max}`,
                photos: photosRef.current,
                featured: featuredRef.current,
                type: typeRef.current,
              };
              const extentClone = view.extent.clone();
              const extentExpanded = extentClone.expand(asyncMarkersPadding);
              const { xmin, xmax, ymin, ymax } = extentExpanded;
              const extent = {
                xmin: xmin,
                xmax: xmax,
                ymin: ymin,
                ymax: ymax,
              };
              console.log('MAP TO SHOW RELATED', filterVal);
              //UPDATE GRID
              updateGrid(view, filterVal);
              //LOAD MARKERS
              let inactive = 'false';
              if (view.zoom > inactiveThreshold) {
                inactive = 'true';
              }
              asyncMarkers(view, filterVal, inactive, extent).then((res) => {
                console.log('MARKER RESPONCE', res);
                generateMarkers(view, res);
              });
            });
            //Popup Tabs Click Event
            $('.page-content').on('click', '.map-popup-tabs .tab', function () {
              let tabType = $(this).find('.tab-type').text();
              $(this).addClass('active').siblings().removeClass('active');
              $(this)
                .closest('.map-popup')
                .find(`.data-${tabType}`)
                .addClass('active')
                .siblings()
                .removeClass('active');
            });
            //Grid Popup List Click Event
            $('.page-content').on(
              'click',
              '.map-popup.grid .data li',
              function () {
                const itemId = $(this).find('.id').text();
                const recnumber = $(this).find('.recnumber').text();
                const markerid = $(this).find('.markerid').text();
                const loctype = $(this).find('.loctype').text();
                const mapyear = $(this).find('.mapyear').text();
                const x = $(this).find('.pointx').text();
                const y = $(this).find('.pointy').text();
                const point = new Point({
                  x: x,
                  y: y,
                  spatialReference: { wkid: 3857 },
                });
                //console.log('GRID LIST', itemId, recnumber, markerid);
                updateTimeline(mapyear);
                gotoMarker(
                  point,
                  itemId,
                  recnumber,
                  markerid,
                  loctype,
                  'people'
                );
              }
            );
            //Marker Popup List Click Event
            $('.page-content').on(
              'click',
              '.map-popup.marker .data li',
              function () {
                const title = $(this)
                  .clone()
                  .children()
                  .remove()
                  .end()
                  .text()
                  .trim();
                const id = $(this).find('span.id').text();
                const recnumber = $(this).find('span.recnumber').text();
                const loctype = $(this).find('span.loctype').text();
                console.log('MARKER POPUP LIST CLICK', {
                  id,
                  recnumber,
                  loctype,
                });
                if (id && recnumber) {
                  loadDetails(id, recnumber, loctype, title);
                } else {
                  console.log('Sorry, id or recumber is missing');
                }
                //LOAD MARKERS
                const filterVal = {
                  search: title,
                  date_range: dateRangeRef.current,
                  photos: photosRef.current,
                  featured: featuredRef.current,
                  type: typeRef.current,
                };
                const extentClone = view.extent.clone();
                const extentExpanded = extentClone.expand(asyncMarkersPadding);
                const { xmin, xmax, ymin, ymax } = extentExpanded;
                const extent = {
                  xmin: xmin,
                  xmax: xmax,
                  ymin: ymin,
                  ymax: ymax,
                };
                if (view.zoom > gridThreshold) {
                  let inactive = 'false';
                  if (view.zoom > inactiveThreshold) {
                    inactive = 'true';
                  }
                  asyncMarkers(view, filterVal, inactive, extent).then(
                    (res) => {
                      console.log('MARKER RESPONCE', res);
                      generateMarkers(view, res);
                    }
                  );
                }
              }
            );
            //Marker Popop Timemachine
            $('.page-content').on('click', '.timemachine .back', function () {
              const currentId = parseInt($('.segment.active').data('id'));
              const firstId = parseInt(
                $('.segment-wrapper.first-wrapper .segment').data('id')
              );
              let newSegmentId = currentId > firstId ? currentId - 1 : null;
              if (newSegmentId) {
                moveThroughTime(newSegmentId);
              }
            });
            $('.page-content').on(
              'click',
              '.timemachine .forward',
              function () {
                const currentId = parseInt($('.segment.active').data('id'));
                const lastId = parseInt(
                  $('.segment-wrapper.last-wrapper .segment').data('id')
                );
                let newSegmentId = currentId < lastId ? currentId + 1 : null;
                if (newSegmentId) {
                  moveThroughTime(newSegmentId);
                }
              }
            );
            //Marker Popop Tooltips
            $('.page-content').on(
              'click',
              '.data-actions .timemachine .tooltip span',
              function () {
                $(this).parent().parent().hide();
              }
            );
            //Map Popup - Full Details click Event
            $('.page-content').on('click', '.full-details', function () {
              const $active = $(this).closest('.map-popup');
              const title = $active
                .find('li.active')
                .clone()
                .children()
                .remove()
                .end()
                .text();
              const id = $active.find('li.active span.id').text();
              const recnumber = $active.find('li.active span.recnumber').text();
              const loctype = $active.find('li.active span.loctype').text();
              console.log(
                'FULL DETAILS BUTTON CLICK',
                `{id: ${id}, recnumber: ${recnumber}, loctype: ${loctype}`
              );
              if (id && recnumber) {
                dispatch(updateListItem({ recnumber, loctype }));
                dispatch(toggleList('hide'));
                dispatch(getDetails({ id, recnumber, loctype }));
                dispatch(toggleDetails('show'));
                dispatch(toggleSubmit('hide'));
                dispatch(updateSearch(title));
                dispatch(getList({}));
              }
            });
            //Map Popup - click new list item
            $('.page-content').on('click', '.map-popup-data li', function () {
              $(this).addClass('active').siblings().removeClass('active');
            });
            //History List Click Event
            $('body').on('click', '.history-list-item', function () {
              const title = $(this)
                .clone()
                .children()
                .remove()
                .end()
                .text()
                .trim();
              const id = $(this).data('id');
              const type = $(this).data('type');
              const itemId = $(this).data('id');
              const markerX = $(this).data('x');
              const markerY = $(this).data('y');
              const recnumber = $(this).data('recnumber');
              const markerid = $(this).data('markerid');
              const loctype = $(this).data('loctype');
              const mapyear = $(this).data('mapyear');
              const point = new Point({
                x: markerX,
                y: markerY,
                spatialReference: { wkid: 3857 },
              });
              console.log('HISTORY LIST CLICK', {
                title,
                id,
                recnumber,
                loctype,
              });
              if (id && recnumber) {
                dispatch(updateListItem({ recnumber, loctype }));
                dispatch(toggleList('hide'));
                dispatch(getDetails({ id, recnumber, loctype }));
                dispatch(toggleDetails('show'));
                dispatch(toggleSubmit('hide'));
                window.timePeriod = null;
                updateTimeline(mapyear);
                gotoMarker(point, itemId, recnumber, markerid, loctype, type);
                dispatch(updateSearch(title));
                dispatch(getList({ title }));
              } else {
                console.log('Sorry, id or recumber is missing');
              }
            });
            //Full Details - source change
            $('.page-content').on('change', '#details-source', function () {
              listClick($(this).find(':selected'));
            });
            //Helper Functions
            function loadDetails(id, recnumber, loctype, title) {
              dispatch(updateListItem({ recnumber, loctype }));
              dispatch(toggleList('hide'));
              dispatch(getDetails({ id, recnumber, loctype }));
              dispatch(toggleDetails('show'));
              dispatch(toggleSubmit('hide'));
              dispatch(updateSearch(title));
              dispatch(getList({}));
            }
            function listClick(item) {
              const type = item.data('type');
              const itemId = item.data('id');
              const markerX = item.data('x');
              const markerY = item.data('y');
              const recnumber = item.data('recnumber');
              const markerid = item.data('markerid');
              const loctype = item.data('loctype');
              const mapyear = item.data('mapyear');
              const point = new Point({
                x: markerX,
                y: markerY,
                spatialReference: { wkid: 3857 },
              });
              console.log('LIST CLICK', { type, itemId });
              updateTimeline(mapyear);
              gotoMarker(point, itemId, recnumber, markerid, loctype, type);
            }
            function hideMarkers(checked) {
              const layers = view.map.layers;
              console.log('HIDE MARKERS', checked);
              if (layers) {
                const hideableLayers = [
                  'marker_layer_active',
                  'marker_layer_inactive',
                  'grid_layer_6',
                  'grid_layer_1',
                  'grid_layer_0.1',
                  'grid_layer_0.05',
                ];
                layers.items.forEach((layer, index) => {
                  if (checked) {
                    console.log('HIDE MARKERS');
                    hideMode.current = true;
                    if (hideableLayers.includes(layer.id)) {
                      layer.visible = false;
                    }
                  } else {
                    console.log('SHOW MARKERS');
                    hideMode.current = false;
                    if (view.zoom <= gridZoom1) {
                      if (layer.id === `grid_layer_${level_1}`) {
                        console.log('SHOW', layer.id);
                        layer.visible = true;
                      }
                    } else if (
                      view.zoom > gridZoom1 &&
                      view.zoom <= gridZoom2
                    ) {
                      if (layer.id === `grid_layer_${level_2}`) {
                        console.log('SHOW', layer.id);
                        layer.visible = true;
                      }
                    } else if (
                      view.zoom > gridZoom2 &&
                      view.zoom <= gridZoom3
                    ) {
                      if (layer.id === `grid_layer_${level_3}`) {
                        console.log('SHOW', layer.id);
                        layer.visible = true;
                      }
                    } else if (
                      view.zoom > gridZoom3 &&
                      view.zoom <= gridThreshold
                    ) {
                      if (layer.id === `grid_layer_${level_4}`) {
                        console.log('SHOW', layer.id);
                        layer.visible = true;
                      }
                    } else if (view.zoom > gridThreshold) {
                      if (layer.id === 'marker_layer_active') {
                        console.log('SHOW', layer.id);
                        layer.visible = true;
                      }
                      if (layer.id === 'marker_layer_inactive') {
                        console.log('SHOW', layer.id);
                        layer.visible = true;
                      }
                    }
                    if (layer.id === 'tile_layer') {
                      view.map.reorder(layer, 0);
                    }
                  }
                });
              }
            }
            function resetMap() {
              const min = $('#date-range .label-min').text();
              const max = $('#date-range .label-max').text();
              dateRangeRef.current = `${min}-${max}`;
              startDateRef.current = `${min}`;
              endDateRef.current = `${max}`;
              const filterVal = {
                search: searchRef.current,
                date_range: `${min}-${max}`,
                photos: photosRef.current,
                featured: featuredRef.current,
                type: typeRef.current,
              };
              console.log('RESET MAIN MAP', min, max, filterVal);
              //CLOSE ANY OPEN POPUPS
              view.popup.close();
              //HIDE TILE LAYER
              toggleTiles('hide');
              //UPDATE GRID
              updateGrid(view, filterVal);
              //RESET ZOOM
              const point = new Point({
                x: -9847493.299600473,
                y: 5961570.438394273,
                spatialReference: { wkid: 3857 },
              });
              const opts = {
                duration: 3000,
              };
              view.goTo({ target: point, zoom: 10 }, opts).then(() => {
                console.log('RESET ZOOM', point, 10);
              });
            }
            function resetTimeline() {
              const min = $('#date-range .label-min').text();
              const max = $('#date-range .label-max').text();
              window.timePeriod = null;
              dispatch(updateActiveSegment(null));
              dispatch(updateLeftPip('0%'));
              dispatch(updateRightPip('100%'));
              dispatch(updateDateRange(`${min}-${max}`));
              dispatch(updateTimelineRange(`${min}-${max}`));
              dispatch(updateStartDate(`${min}`));
              dispatch(updateEndDate(`${max}`));
              dispatch(updateReset(false));
              dispatch(getList({}));
            }
            function landingSearch() {
              const searchValue = $('#search-landing').val();
              searchRef.current = `${searchValue}`;
              const filterVal = {
                search: `${searchValue}`,
                date_range: dateRangeRef.current,
                photos: photosRef.current,
                featured: featuredRef.current,
                type: typeRef.current,
              };
              console.log('LANDING SEARCH', filterVal);
              const point = new Point({
                x: -9847493.299600473,
                y: 5961570.438394273,
                spatialReference: { wkid: 3857 },
              });
              view
                .goTo({ target: point, zoom: 10 }, { duration: 3000 })
                .then(() => {
                  updateGrid(view, filterVal);
                });
            }
            function mainSearch(clear) {
              const searchValue = clear ? '' : $('#search').val();
              if (clear) {
                markersLoadedRef.current = false;
              }
              const min = $('#date-range .label-min').text();
              const max = $('#date-range .label-max').text();
              searchRef.current = `${searchValue}`;
              // dateRangeRef.current = `${min}-${max}`;
              // startDateRef.current = `${min}`;
              // endDateRef.current = `${max}`;
              const filterVal = {
                search: `${searchValue}`,
                date_range: `${min}-${max}`,
                photos: photosRef.current,
                featured: featuredRef.current,
                type: typeRef.current,
              };
              const extentClone = view.extent.clone();
              const extentExpanded = extentClone.expand(asyncMarkersPadding);
              const { xmin, xmax, ymin, ymax } = extentExpanded;
              const extent = {
                xmin: xmin,
                xmax: xmax,
                ymin: ymin,
                ymax: ymax,
              };
              console.log('SEARCH CHANGE', filterVal);
              //CLOSE TIME CHOOSER IF OPEN
              setShowTimeChooser(false);
              //RESET HIDE MARKERS
              hideMarkers(false);
              const hideChecked = !$(
                '.toggle-switch-checkbox[data-type="hide"]'
              ).is(':checked');
              console.log('hideChecked', hideChecked);
              dispatch(updateHide(true));
              //UPDATE TIMELINE
              //resetTimeline();
              //CLOSE POPUP
              view.popup.close();
              //CLOSE DETAILS
              dispatch(toggleDetails('hide'));
              //UPDATE GRID
              updateGrid(view, filterVal);
              //LOAD MARKERS
              if (view.zoom > gridThreshold) {
                let inactive = 'false';
                if (view.zoom > inactiveThreshold) {
                  inactive = 'true';
                }
                asyncMarkers(view, filterVal, inactive, extent).then((res) => {
                  console.log('MARKER RESPONCE', res);
                  generateMarkers(view, res);
                });
              }
              //HIDE TILES
              //toggleTiles('hide');
              //RESET EXTENTS
              // const point = new Point({
              //   x: -9847493.299600473,
              //   y: 5961570.438394273,
              //   spatialReference: { wkid: 3857 },
              // });
              // view
              //   .goTo({ target: point, zoom: 10 }, { duration: 3000 })
              //   .then(() => {
              //     updateGrid(view, filterVal);
              //   });
            }
            function moveThroughTime(segmentId) {
              const $target = $(`.segment-${segmentId}`);
              const min = $target.data('min');
              const max = $target.data('max');
              const left = $target.data('left');
              const right = $target.data('right');
              const url = $target.data('url');
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
              const extentExpanded = extentClone.expand(asyncMarkersPadding);
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
              createTileLayer({ url, zoom: false });
              //UPDATE GRID
              updateGrid(view, filterVal);
              //LOAD MARKERS
              if (view.zoom > gridThreshold) {
                let inactive = 'false';
                if (view.zoom > inactiveThreshold) {
                  inactive = 'true';
                }
                asyncMarkers(view, filterVal, inactive, extent).then((res) => {
                  console.log('MARKER RESPONCE', res);
                  generateMarkers(view, res);
                });
              }
              //UPDATE TIMELINE
              dispatch(updateActiveSegment(`${segmentId}`));
              dispatch(updateLeftPip(left));
              dispatch(updateRightPip(right));
              dispatch(updateDateRange(`${min}-${max}`));
              dispatch(updateStartDate(`${min}`));
              dispatch(updateEndDate(`${max}`));
              dispatch(updateReset(true));
              dispatch(getList({}));
              //UPDATE MARKER POPUP
              asyncMarkerPopUp().then(function (res) {
                view.popup.content = res;
              });
              asyncMarkerTitle().then(function (res) {
                view.popup.title = res;
              });
            }
            function dateChange(min, max, url) {
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
              const extentExpanded = extentClone.expand(asyncMarkersPadding);
              const { xmin, xmax, ymin, ymax } = extentExpanded;
              const extent = {
                xmin: xmin,
                xmax: xmax,
                ymin: ymin,
                ymax: ymax,
              };
              console.log('TIME CHOOSER CHANGE', filterVal);
              dispatch(updateTimelineRange(`${min}-${max}`));
              dispatch(updateReset(true));
              //UPDATE GRID
              updateGrid(view, filterVal);
              //LOAD MARKERS
              if (view.zoom > gridThreshold) {
                let inactive = 'false';
                if (view.zoom > inactiveThreshold) {
                  inactive = 'true';
                }
                asyncMarkers(view, filterVal, inactive, extent).then((res) => {
                  console.log('MARKER RESPONCE', res);
                  generateMarkers(view, res);
                });
              }
            }
          })
          .catch(function (e) {
            console.error('Creating FeatureLayer failed', e);
          });

        view.on('click', function (event) {
          //console.log(event.mapPoint);
          view.hitTest(event).then(function (response) {
            let graphic = response.results[0].graphic;
            console.log('GRAPHIC ATTR', graphic);
          });
        });

        watchUtils.whenTrue(view, 'stationary', function () {
          if (view.ready && view.extent) {
            //console.log('VIEW UI', view.ui);
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
            const markerExtent = window.markerExtent;
            const timePeriod = window.timePeriod;
            const extentClone = view.extent.clone();

            if (view.zoom > gridThreshold && !timePeriod) {
              setShowTimeChooser(true);
              setLoadingMarkers(false);
            } else if (view.zoom > gridThreshold) {
              if (!markerExtent) {
                console.log('WINDOW', markerExtent);
                window.markerExtent = extentClone.expand(asyncMarkersPadding);
              }
              const isInside = window.markerExtent.contains(extentClone);

              const showInactive = view.zoom > inactiveThreshold;

              let inactiveReload = false;
              if (showInactive !== inactiveStatus.current) {
                inactiveStatus.current = showInactive;
                inactiveReload = true;
              } else {
                inactiveReload = false;
              }
              let inactive = inactiveStatus.current ? 'true' : 'false';

              //LOAD MARKERS
              if (!isInside || !markersLoadedRef.current || inactiveReload) {
                const expanded = view.extent
                  .clone()
                  .expand(asyncMarkersPadding);
                window.markerExtent = expanded;
                const { xmin, xmax, ymin, ymax } = expanded;
                const extent = {
                  xmin: xmin,
                  xmax: xmax,
                  ymin: ymin,
                  ymax: ymax,
                };
                const filters = {
                  search: searchRef.current,
                  date_range: dateRangeRef.current,
                  photos: photosRef.current,
                  featured: featuredRef.current,
                  type: typeRef.current,
                };
                asyncMarkers(view, filters, inactive, extent).then((res) => {
                  console.log('MARKER MAP RESPONCE', res);
                  generateMarkers(view, res);
                  markersLoadedRef.current = true;
                });
              }
            }
            //Below was in place to only show to opacity slide when at the marker level,
            //but is commented out so that it will show always
            //It has been left here for future reference is needed
            // if (view.zoom > gridThreshold) {
            //   view.ui.add(opacitySlider, 'top-right');
            // } else if (view.zoom <= gridThreshold) {
            //   view.ui.remove(opacitySlider);
            // }
            //SHOW HIDE LAYERS
            const layers = view.map.layers;
            if (layers) {
              //console.log('LAYERS', layers.length);
              layers.items.forEach((layer, index) => {
                if (layer.id === 'tile_layer') {
                  view.map.reorder(layer, 0);
                }
                if (layer.id === 'marker_layer_active') {
                  const totalLayers = layers.items.length;
                  const maxIndex = totalLayers - 1;
                  view.map.reorder(layer, maxIndex);
                }
                if (view.zoom <= gridZoom1) {
                  view.popup.close();
                  if (layer.id === `grid_layer_${level_1}`) {
                    if (!hideMode.current) {
                      console.log('SHOW', layer.id);
                      layer.visible = true;
                    }
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
                } else if (view.zoom > gridZoom1 && view.zoom <= gridZoom2) {
                  view.popup.close();
                  if (layer.id === `grid_layer_${level_1}`) {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (layer.id === `grid_layer_${level_2}`) {
                    if (!hideMode.current) {
                      console.log('SHOW', layer.id);
                      layer.visible = true;
                    }
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
                } else if (view.zoom > gridZoom2 && view.zoom <= gridZoom3) {
                  view.popup.close();
                  if (layer.id === `grid_layer_${level_1}`) {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (layer.id === `grid_layer_${level_2}`) {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                  if (layer.id === `grid_layer_${level_3}`) {
                    if (!hideMode.current) {
                      console.log('SHOW', layer.id);
                      layer.visible = true;
                    }
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
                } else if (
                  view.zoom > gridZoom3 &&
                  view.zoom <= gridThreshold
                ) {
                  view.popup.close();
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
                    if (!hideMode.current) {
                      console.log('SHOW', layer.id);
                      layer.visible = true;
                    }
                  }
                  if (
                    layer.id === 'marker_layer_active' ||
                    layer.id === 'marker_layer_inactive'
                  ) {
                    console.log('HIDE', layer.id);
                    layer.visible = false;
                  }
                } else if (view.zoom > gridThreshold) {
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
                  if (layer.id === 'marker_layer_inactive') {
                    if (!hideMode.current) {
                      console.log('SHOW', layer.id);
                      layer.visible = true;
                    }
                  }
                  if (layer.id === 'marker_layer_active') {
                    if (!hideMode.current) {
                      console.log('SHOW', layer.id);
                      layer.visible = true;
                    }
                  }
                }
              });
            }
          }
        });

        function updateOpacity() {
          const opacity = opacitySlider.values[0] / 100;
          const ifLayers = view.map.layers.items.length;
          if (ifLayers) {
            const existingLayers = view.map.layers.items;
            existingLayers.forEach(function (item, i) {
              if (item.id === 'tile_layer') {
                item.opacity = opacity;
              }
            });
          }
        }

        function toggleTiles(state) {
          tileUrlRef.current = '';
          const ifLayers = view.map.layers.items.length;
          if (ifLayers) {
            const existingLayers = view.map.layers.items;
            existingLayers.forEach(function (item, i) {
              if (item.id === 'tile_layer') {
                if (state === 'show') {
                  item.visible = true;
                } else {
                  item.visible = false;
                }
              }
            });
          }
        }

        function updateGrid(view, filters) {
          //GRID LEVEL 1
          asyncGrid(view, filters, '6').then((res) => {
            console.log('GRID LEVEL 1 RESPONCE', res);
            //generateGridInactive(res.inactive);
            generateGrid(view, res.active, filters.type, '6', '28');
          });
          //GRID LEVEL 2
          asyncGrid(view, filters, '1').then((res) => {
            console.log('GRID LEVEL 2 RESPONCE', res);
            //generateGridInactive(res.inactive);
            generateGrid(view, res.active, filters.type, '1', '4');
          });
          //GRID LEVEL 3
          asyncGrid(view, filters, '0.1').then((res) => {
            console.log('GRID LEVEL 3 RESPONCE', res);
            //generateGridInactive(res.inactive);
            generateGrid(view, res.active, filters.type, '0.1', '0.4');
          });
          //GRID LEVEL 4
          asyncGrid(view, filters, '0.05').then((res) => {
            console.log('GRID LEVEL 4 RESPONCE', res);
            //generateGridInactive(res.inactive);
            generateGrid(view, res.active, filters.type, '0.05', '0.2');
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
              //console.log('CELL GRAPHIC', attr);
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
          //console.log('GRID GRAPHICS', gridGraphics);
          createGridLayer(view, gridGraphics, type, size);
        }

        function createGridLayer(view, graphics, type, size) {
          //console.log('GRAPHICS', graphics);
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
            case 'everything':
              gridColor = [0, 0, 0, 255];
              break;
            default:
              console.log(`Sorry, ${type} is not an option`);
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
          if (size === '6' && view.zoom <= gridZoom1 && !hideMode.current) {
            show = true;
            //zoom = true;
          } else if (
            size === '1' &&
            view.zoom > gridZoom1 &&
            view.zoom <= gridZoom2 &&
            !hideMode.current
          ) {
            show = true;
          } else if (
            size === '0.1' &&
            view.zoom > gridZoom2 &&
            view.zoom <= gridZoom3 &&
            !hideMode.current
          ) {
            show = true;
          } else if (
            size === '0.08' &&
            view.zoom > gridZoom3 &&
            view.zoom <= gridThreshold &&
            !hideMode.current
          ) {
            show = true;
          } else if (view.zoom > gridThreshold) {
            show = false;
          } else {
            show = false;
          }
          //console.log('SHOW', show);
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
              {
                name: 'size',
                alias: 'Size',
                type: 'string',
              },
              {
                name: 'title',
                alias: 'Title',
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
              title: '{title}',
              outFields: ['*'],
              content: asyncGridPopUp,
            },
          });
          addToView(grid);
          // if (zoom) {
          //   grid.when().then(function (layer) {
          //     view.goTo(layer.fullExtent, { duration: 3000 });
          //   });
          // }
        }

        function generateMarkers(view, markers) {
          const allActive = markers.active ? markers.active.results : [];
          const allInActive = markers.inactive ? markers.inactive.results : [];
          //console.log('allActive', allActive);
          const activeGraphics = [];
          const inactiveGraphics = [];
          allActive.forEach((marker) => {
            if (marker.x) {
              const point = new Point({
                x: marker.x,
                y: marker.y,
                spatialReference: { wkid: 3857 },
              });
              const markerId = marker.id;
              const attr = { ...marker, markerId };
              const graphic = new Graphic({
                geometry: point,
                attributes: attr,
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
              const point = new Point({
                x: marker.x,
                y: marker.y,
                spatialReference: { wkid: 3857 },
              });
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
          // if (inactiveGraphics.length > 0) {
          //   createInactiveMarkerLayer(view, inactiveGraphics);
          // } else {
          //   console.log('No Inactive markers in this area');
          // }
          createInactiveMarkerLayer(view, inactiveGraphics);
          // if (activeGraphics.length > 0) {
          //   createActiveMarkerLayer(view, activeGraphics);
          // } else {
          //   console.log('No Active markers in this area');
          // }
          createActiveMarkerLayer(view, activeGraphics);
        }

        //  Creates a client-side FeatureLayer from an array of graphics
        function createActiveMarkerLayer(view, graphics) {
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
                value: 'people',
                label: 'People',
                symbol: {
                  type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
                  url: peopleMarkerImage,
                  width: '30px',
                  height: '30px',
                },
              },
              {
                value: 'places',
                label: 'Places',
                symbol: {
                  type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
                  url: placeMarkerImage,
                  width: '30px',
                  height: '30px',
                },
              },
              {
                value: 'stories',
                label: 'Stories',
                symbol: {
                  type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
                  url: storyMarkerImage,
                  width: '30px',
                  height: '30px',
                },
              },
            ],
          };
          const show = view.zoom > gridThreshold ? true : false;
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
              title: asyncMarkerTitle,
              outFields: ['*'],
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
                value: 'people',
                label: 'People',
                symbol: {
                  type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
                  url: peopleMarkerImage,
                  width: '30px',
                  height: '30px',
                },
              },
              {
                value: 'places',
                label: 'Places',
                symbol: {
                  type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
                  url: placeMarkerImage,
                  width: '30px',
                  height: '30px',
                },
              },
              {
                value: 'stories',
                label: 'Stories',
                symbol: {
                  type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
                  url: storyMarkerImage,
                  width: '30px',
                  height: '30px',
                },
              },
            ],
          };
          const show =
            view.zoom > inactiveThreshold && !hideMode.current ? true : false;
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
              title: asyncMarkerTitle,
              outFields: ['*'],
              content: asyncMarkerPopUp,
            },
          });
          addToView(layer);
        }

        function createTileLayer(options) {
          const { url, zoom } = options;
          console.log('TILE SETTINGS', url, zoom);
          const tileLayer = new TileLayer({
            id: 'tile_layer',
            url,
            visible: true,
          });
          console.log('TILE LAYER', tileLayer);
          addToView(tileLayer);
          updateOpacity();
          tileLayer.when().then(function (layer) {
            view.map.reorder(layer, 0);
            if (zoom) {
              view.goTo(layer.fullExtent, { duration: 3000 });
            }
          });
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
            //const existingLayersIDs = existingLayers.map((layer) => layer.id);
            //console.log('existingLayersIDs', existingLayersIDs);
            existingLayers.forEach(function (item, i) {
              if (layer.id === item.id) {
                view.map.layers.remove(item);
              }
            });
          }
          view.map.add(layer);
        }

        //Updates the timeline if has not been previously set
        function updateTimeline(mapyear) {
          //console.log('updateTimeline', !window.timePeriod, mapyear);
          $('#date-range .segment').each(function () {
            const id = $(this).data('id');
            const url = $(this).data('url');
            const left = $(this).data('left');
            const right = $(this).data('right');
            const min = $(this).data('min');
            const max = $(this).data('max');
            //if (!window.timePeriod) {
            if (mapyear >= min && mapyear <= max) {
              dateRangeRef.current = `${min}-${max}`;
              startDateRef.current = `${min}`;
              endDateRef.current = `${max}`;
              tileUrlRef.current = url;
              dispatch(updateTimelineRange(`${min}-${max}`));
              dispatch(updateActiveSegment(`${id}`));
              dispatch(updateActiveUrl(url));
              dispatch(updateLeftPip(left));
              dispatch(updateRightPip(right));
              dispatch(updateDateRange(`${min}-${max}`));
              dispatch(updateStartDate(`${min}`));
              dispatch(updateEndDate(`${max}`));
              createTileLayer({ url, zoom: false });
              handleTimePeriod();
              dispatch(updateReset(true));
              //dispatch(getList({}));
              console.log('TIMELINE UPDATE', `${min}-${max}`, url);
            }
            //}
          });
        }

        //Pan and Zoom map to a given marker
        function gotoMarker(point, itemId, recnumber, markerid, loctype, type) {
          //console.log('gotoMarker', markerid);
          activeMarkerRecnumberRef.current = recnumber;
          activeMarkerIdRef.current = markerid;
          activeMarkerLoctypeRef.current = loctype;
          activeMarkerTypeRef.current = type;
          const newZoom = inactiveThreshold + 1;
          const opts = {
            duration: 3000,
          };
          view.goTo({ target: point, zoom: newZoom }, opts).then(() => {
            view.popup.open({
              title: '',
              location: view.center,
            });
            const filterVal = {
              search: searchRef.current,
              date_range: dateRangeRef.current,
              photos: photosRef.current,
              featured: featuredRef.current,
              type: typeRef.current,
            };
            const { xmin, xmax, ymin, ymax } = view.extent;
            const extent = {
              xmin: xmin,
              xmax: xmax,
              ymin: ymin,
              ymax: ymax,
            };
            asyncMarkerInfo(recnumber, markerid, loctype, type, filterVal).then(
              function (res) {
                view.popup.title = res.title;
                view.popup.content = res.body;
              }
            );
            //LOAD MARKERS
            // asyncMarkers(view, filterVal, 'true', extent).then((res) => {
            //   console.log('MARKER RESPONCE', res);
            //   generateMarkers(view, res);
            // });
          });
        }
      }
    );
  }, [dispatch]);

  //POPUP - When grid item is clicked
  const asyncGridPopUp = (target) => {
    //console.log('TARGET', target);
    let filters = {
      search: searchRef.current,
      id: target.graphic.attributes.id,
      size: target.graphic.attributes.size,
      filters: {
        date_range: dateRangeRef.current,
        photos: photosRef.current,
        featured: featuredRef.current,
        type: 'everything',
      },
    };
    console.log('GRID CLICK INFO', filters);
    return axios
      .post('http://geospatialresearch.mtu.edu/grid_cell.php', filters)
      .then((res) => {
        console.log('POPUP DATA', res.data);
        const source = res.data.active;
        const peopleCount = source.people.length;
        const placesCount = source.places.length;
        const storiesCount = source.stories.length;
        const peopleData = source.people.results;
        const placesData = source.places.results;
        const storiesData = source.stories.results;
        const peopleTitles = peopleData.map((person) => person);
        const placesTitles = placesData.map((place) => place);
        const storiesTitles = storiesData.map((story) => story);
        let stringPeople = peopleCount
          ? ''
          : '<li>No person records at this location</li>';
        let stringPlaces = placesCount
          ? ''
          : '<li>No building records at this location</li>';
        let stringStories = storiesCount
          ? ''
          : '<li>No stories at this location</li>';
        peopleTitles.forEach((item) => {
          //console.log(item);
          stringPeople =
            stringPeople +
            `<li>${item.title}
            <span class="id">${item.id}</span>
            <span class="recnumber">${item.recnumber}</span>
            <span class="markerid">${item.markerid}</span>
            <span class="pointx">${item.x}</span>
            <span class="pointy">${item.y}</span>
            <span class="mapyear">${item.map_year}</span>
            </li>`;
        });
        placesTitles.forEach((item) => {
          stringPlaces =
            stringPlaces +
            `<li>${item.title}
            <span class="id">${item.id}</span>
            <span class="recnumber">${item.recnumber}</span>
            <span class="markerid">${item.markerid}</span>
            <span class="pointx">${item.x}</span>
            <span class="pointy">${item.y}</span>
            <span class="mapyear">${item.map_year}</span>
            </li>`;
        });
        storiesTitles.forEach((item) => {
          stringStories =
            stringStories +
            `<li>${item.title}
            <span class="id">${item.id}</span>
            <span class="recnumber">${item.recnumber}</span>
            <span class="markerid">${item.markerid}</span>
            <span class="pointx">${item.x}</span>
            <span class="pointy">${item.y}</span>
            <span class="mapyear">${item.map_year}</span>
            </li>`;
        });
        let tabStatus = getTabStatus({
          peopleCount,
          placesCount,
          storiesCount,
        });
        //console.log('POPUP TAB STATUS', tabStatus);
        return `
        <div class="map-popup grid">
          <div class="map-popup-tabs">
            <div class="tab tab-people${tabStatus.people}"><i class="fas fa-user"></i> <span>(${peopleCount})</span><span class="tab-type" style="display: none;">people</span></div>
            <div class="tab tab-places${tabStatus.places}"><i class="fas fa-building"></i> <span>(${placesCount})</span><span class="tab-type" style="display: none;">places</span></div>
            <div class="tab tab-stories${tabStatus.stories}"><i class="fas fa-book-open"></i> <span>(${storiesCount})</span><span class="tab-type" style="display: none;">stories</span></div>
          </div>
          <div class="map-popup-data">
            <div class="data data-people${tabStatus.people}">
              <ul>
              ${stringPeople}
              </ul>
            </div>
            <div class="data data-places${tabStatus.places}">
              <ul>
              ${stringPlaces}
              </ul>
            </div>
            <div class="data data-stories${tabStatus.stories}">
              <ul>
              ${stringStories}
              </ul>
            </div>
          </div>
        </div>
        `;
      })
      .catch((error) => console.log(error));
  };

  //POPUP - When list item is clicked
  const asyncMarkerInfo = (recnumber, markerid, loctype, type, filterVal) => {
    //console.log('asyncMarkerInfo', recnumber, markerid, filterVal);
    let filters = {
      search: filterVal.search,
      id: markerid,
      recnumber: recnumber,
      loctype: loctype,
      filters: {
        date_range: filterVal.date_range,
        photos: filterVal.photos,
        featured: filterVal.featured,
        type: 'everything',
      },
    };
    console.log('LIST CLICK MARKER INFO', filters);
    return axios
      .post('http://geospatialresearch.mtu.edu/marker_info.php', filters)
      .then((res) => {
        const active = res.data.active;
        const title = active.title ? active.title : 'Record Location';
        const peopleCount = active.people.length;
        const placesCount = active.places.length;
        const storiesCount = active.stories.length;
        const peopleData = active.people.results;
        const placesData = active.places.results;
        const storiesData = active.stories.results;
        const peopleTitles = peopleData.map((person) => {
          const id = person.id;
          const recnumber = person.recnumber;
          const loctype = person.loctype;
          const highlight = person.highlighted;
          const style = highlight === 'true' ? ' class="active"' : '';
          return `<li${style}>${person.title}<span class="id">${id}</span><span class="recnumber">${recnumber}</span><span class="loctype">${loctype}</span></li>`;
        });
        const placesTitles = placesData.map((place) => {
          const id = place.id;
          const recnumber = place.recnumber;
          const loctype = place.loctype;
          const highlight = place.highlighted;
          const style = highlight === 'true' ? ' class="active"' : '';
          return `<li${style}>${place.title}<span class="id">${id}</span><span class="recnumber">${recnumber}</span><span class="loctype">${loctype}</span></li>`;
        });
        const storiesTitles = storiesData.map((story) => {
          const id = story.id;
          const recnumber = story.recnumber;
          const loctype = story.loctype;
          const highlight = story.highlighted;
          const style = highlight === 'true' ? ' class="active"' : '';
          return `<li${style}>${story.title}<span class="id">${id}</span><span class="recnumber">${recnumber}</span><span class="loctype">${loctype}</span></li>`;
        });
        let stringPeople = peopleCount
          ? ''
          : '<li>No person records at this location</li>';
        let stringPlaces = placesCount
          ? ''
          : '<li>No building records at this location</li>';
        let stringStories = storiesCount
          ? ''
          : '<li>No stories at this location</li>';
        peopleTitles.forEach((title) => {
          stringPeople = stringPeople + title;
        });
        placesTitles.forEach((title) => {
          stringPlaces = stringPlaces + title;
        });
        storiesTitles.forEach((title) => {
          stringStories = stringStories + title;
        });
        let tabStatus = getTabStatus({
          peopleCount,
          placesCount,
          storiesCount,
        });
        console.log('POPUP TAB STATUS', tabStatus);
        return {
          title,
          body: `
        <div class="map-popup marker">
          <div class="map-popup-tabs">
            <div class="tab tab-people${tabStatus.people}"><i class="fas fa-user"></i> <span>(${peopleCount})</span><span class="tab-type" style="display: none;">people</span></div>
            <div class="tab tab-places${tabStatus.places}"><i class="fas fa-building"></i> <span>(${placesCount})</span><span class="tab-type" style="display: none;">places</span></div>
            <div class="tab tab-stories${tabStatus.stories}"><i class="fas fa-book-open"></i> <span>(${storiesCount})</span><span class="tab-type" style="display: none;">stories</span></div>
          </div>
          <div class="map-popup-data">
            <div class="data data-people${tabStatus.people}">
              <ul>
              ${stringPeople}
              </ul>
            </div>
            <div class="data data-places${tabStatus.places}">
              <ul>
              ${stringPlaces}
              </ul>
            </div>
            <div class="data data-stories${tabStatus.stories}">
              <ul>
              ${stringStories}
              </ul>
            </div>
          </div>
          <div class="data-actions">
            <div class="full-details">Full details</div>
          </div>
        </div>
        `,
        };
      })
      .catch((error) => console.log(error));
  };

  //POPUP - When marker is clicked
  const asyncMarkerPopUp = (target) => {
    //console.log('TARGET', target.graphic.attributes);
    //const layerID = target ? target.graphic.layer.id : null;
    const targetID = target ? target.graphic.attributes.id : null;
    const markerID = targetID ? targetID : activeMarkerIdRef.current;
    if (targetID) activeMarkerIdRef.current = markerID;
    let filters = {
      search: searchRef.current,
      id: markerID,
      recnumber: '',
      filters: {
        date_range: dateRangeRef.current,
        photos: photosRef.current,
        featured: featuredRef.current,
        type: 'everything',
      },
    };
    console.log('MARKER CLICK MARKER INFO', filters);
    return axios
      .post('http://geospatialresearch.mtu.edu/marker_info.php', filters)
      .then((res) => {
        console.log('MARKER CLICK POPUP DATA', res.data);
        // const source =
        //   layerID === 'marker_layer_active'
        //     ? res.data.active
        //     : res.data.inactive;
        const source = res.data.active;
        const peopleCount = source.people.length;
        const placesCount = source.places.length;
        const storiesCount = source.stories.length;
        const peopleData = source.people.results;
        const placesData = source.places.results;
        const storiesData = source.stories.results;
        const peopleTitles = peopleData.map((person) => {
          const id = person.id;
          const recnumber = person.recnumber;
          const loctype = person.loctype;
          const highlight = person.highlighted;
          const style = highlight === 'true' ? ' class="active"' : '';
          return `<li${style}>${person.title}<span class="id">${id}</span><span class="recnumber">${recnumber}</span><span class="loctype">${loctype}</span></li>`;
        });
        const placesTitles = placesData.map((place) => {
          const id = arcgisSafeString(place.id);
          const recnumber = arcgisSafeString(place.recnumber);
          const loctype = place.loctype;
          const highlight = place.highlighted;
          const style = highlight === 'true' ? ' class="active"' : '';
          return `<li${style}>${place.title}<span class="id">${id}</span><span class="recnumber">${recnumber}</span><span class="loctype">${loctype}</span></li>`;
        });
        const storiesTitles = storiesData.map((story) => {
          const id = arcgisSafeString(story.id);
          const recnumber = arcgisSafeString(story.recnumber);
          const loctype = story.loctype;
          const highlight = story.highlighted;
          const style = highlight === 'true' ? ' class="active"' : '';
          return `<li${style}>${story.title}<span class="id">${id}</span><span class="recnumber">${recnumber}</span><span class="loctype">${loctype}</span></li>`;
        });
        let stringPeople = peopleCount
          ? ''
          : '<li>No person records at this location</li>';
        let stringPlaces = placesCount
          ? ''
          : '<li>No building records at this location</li>';
        let stringStories = storiesCount
          ? ''
          : '<li>No stories at this location</li>';
        peopleTitles.forEach((title) => {
          stringPeople = stringPeople + title;
        });
        placesTitles.forEach((title) => {
          stringPlaces = stringPlaces + title;
        });
        storiesTitles.forEach((title) => {
          stringStories = stringStories + title;
        });
        let tabStatus = getTabStatus({
          peopleCount,
          placesCount,
          storiesCount,
        });
        console.log('POPUP TAB STATUS', tabStatus);
        return `
        <div class="map-popup marker">
          <div class="map-popup-tabs">
            <div class="tab tab-people${tabStatus.people}"><i class="fas fa-user"></i> <span>(${peopleCount})</span><span class="tab-type" style="display: none;">people</span></div>
            <div class="tab tab-places${tabStatus.places}"><i class="fas fa-building"></i> <span>(${placesCount})</span><span class="tab-type" style="display: none;">places</span></div>
            <div class="tab tab-stories${tabStatus.stories}"><i class="fas fa-book-open"></i> <span>(${storiesCount})</span><span class="tab-type" style="display: none;">stories</span></div>
          </div>
          <div class="map-popup-data">
            <div class="data data-people${tabStatus.people}">
              <ul>
              ${stringPeople}
              </ul>
            </div>
            <div class="data data-places${tabStatus.places}">
              <ul>
              ${stringPlaces}
              </ul>
            </div>
            <div class="data data-stories${tabStatus.stories}">
              <ul>
              ${stringStories}
              </ul>
            </div>
            <div class="data data-no-results${tabStatus.noResultsStatus}">
              <ul>
                <li>The records for this location are in a different time period. To see them try moving forward or back in time.</li>
              </ul>
            </div>
          </div>
          <div class="data-actions">
            <div class="timemachine">
              <div class="back"><i class="far fa-chevron-left"></i> Back</div>
              <div class="current-time">${dateRangeRef.current}</div>
              <div class="forward">Forward <i class="far fa-chevron-right"></i></div>
              <div class="tooltip data">For more details choose a record at this location.<div><span>Got it!</span></div></div>
              <div class="tooltip time">Use the arrows to move forward or backward through time at a given location.<div><span>Got it!</span></div></div>
            </div>
          </div>
        </div>
        `;
      })
      .catch((error) => console.log(error));
  };
  const asyncMarkerTitle = (target) => {
    const targetID = target ? target.graphic.attributes.id : null;
    const markerID = targetID ? targetID : activeMarkerIdRef.current;
    if (targetID) activeMarkerIdRef.current = markerID;
    let filters = {
      search: searchRef.current,
      id: markerID,
      recnumber: '',
      filters: {
        date_range: dateRangeRef.current,
        photos: photosRef.current,
        featured: featuredRef.current,
        type: 'everything',
      },
    };
    return axios
      .post('http://geospatialresearch.mtu.edu/marker_info.php', filters)
      .then((res) => {
        const sourceTitle = res.data.active.title;
        console.log('POPUP TITLE', sourceTitle);
        const title = sourceTitle ? sourceTitle : 'Record Location';
        return title;
      })
      .catch((error) => console.log(error));
  };
  const asyncGrid = (view, filters, size) => {
    if (view.zoom <= gridThreshold) {
      setLoadingMarkers(true);
    }
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
        if (view.zoom <= gridThreshold) {
          setLoadingMarkers(false);
        }
        return res.data;
      })
      .catch((error) => console.log(error));
  };
  const asyncMarkers = (view, filters, inactive, extent) => {
    console.log(
      'asyncMarkers',
      filters,
      inactive,
      extent,
      `Area padding: ${asyncMarkersPadding}`
    );
    if (view.zoom > gridThreshold) {
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
        inactive,
        filters: {
          date_range: date_range,
          photos: photos,
          featured: featured,
          type: type,
        },
      })
      .then((res) => {
        if (view.zoom > gridThreshold) {
          markersLoadedRef.current = false;
          setLoadingMarkers(false);
        }
        return res.data;
      })
      .catch((error) => console.log(error));
  };
  const getTabStatus = (tabCount) => {
    let tabStatus = {
      people: '',
      places: '',
      stories: '',
      noResultsStatus: '',
    };
    const { peopleCount, placesCount, storiesCount } = tabCount;
    //console.log('TAB COUNT', peopleCount, placesCount, storiesCount);
    const radioActive = $('.filter-radios input:checked + label').attr('class');
    //console.log('RADIO ACTIVE', radioActive);
    if (peopleCount + placesCount + storiesCount) {
      switch (radioActive) {
        case 'everything':
          if (peopleCount) {
            tabStatus = {
              people: ' active',
              places: '',
              stories: '',
              noResultsStatus: '',
            };
          } else if (placesCount) {
            tabStatus = {
              people: '',
              places: ' active',
              stories: '',
              noResultsStatus: '',
            };
          } else if (storiesCount) {
            tabStatus = {
              people: '',
              places: '',
              stories: ' active',
              noResultsStatus: '',
            };
          } else {
            tabStatus = {
              people: ' active',
              places: '',
              stories: '',
              noResultsStatus: '',
            };
          }
          break;
        case 'people':
          tabStatus = {
            people: ' active',
            places: '',
            stories: '',
            noResultsStatus: '',
          };
          break;
        case 'places':
          tabStatus = {
            people: '',
            places: ' active',
            stories: '',
            noResultsStatus: '',
          };
          break;
        case 'stories':
          tabStatus = {
            people: '',
            places: '',
            stories: ' active',
            noResultsStatus: '',
          };
          break;
        default:
          tabStatus = {
            people: ' active',
            places: '',
            stories: '',
            noResultsStatus: '',
          };
      }
    } else {
      tabStatus = {
        people: '',
        places: '',
        stories: '',
        noResultsStatus: ' active',
      };
    }
    return tabStatus;
  };
  const handleTimePeriod = () => {
    window.timePeriod = true;
    setShowTimeChooser(false);
  };
  const arcgisSafeString = (str) => {
    let safeString = str.replace('{', '&#123;');
    safeString = safeString.replace('}', '&#125;');
    return safeString;
  };
  // const open = useSelector(selectShowDetails);
  // const wrapperClasses = open ? 'map-wrapper close' : 'map-wrapper';
  const wrapperClasses = 'map-wrapper';
  return (
    <div className={wrapperClasses}>
      <div className="webmap map" ref={mapRef} />
      <div id="share-help">
        <div id="share-story" className="share-story">
          <FontAwesomeIcon icon={faPencil} className="fa-icon" />
          <span>
            Share a
            <br />
            story
          </span>
        </div>
        <div id="explorer-help" className="explorer-help">
          <FontAwesomeIcon icon={faQuestion} className="fa-icon" />
          <span>
            I need
            <br />
            help
          </span>
        </div>
      </div>
      <Chooser show={showTimeChooser} update={handleTimePeriod} />
      {loadingMarkers && <Loader />}
    </div>
  );
}

export default KeTTMap;
