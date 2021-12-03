//React
import React, { useState, useEffect, useRef } from 'react';
import $ from 'jquery';
//ArchGIS
import { loadModules } from 'esri-loader';
//Styles
import './styles.scss';
//Images
import peopleMarkerImage from './images/marker_person_details.png';
import placesMarkerImage from './images/marker_place_details.png';
import storiesMarkerImage from './images/marker_story_details.png';
//import placeMarkerImage from './images/marker_place.png';
//import storyMarkerImage from './images/marker_story.png';
//Components
import Loader from '../../Map/Loader';

export default function Map(props) {
  const { show } = props;
  const [loadingMap, setLoadingMap] = useState(true);
  const mapRef = useRef();

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
        BasemapToggle,
      ]) => {
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
            xmin: -9994328.830936352,
            xmax: -9700657.768264594,
            ymin: 5872979.92261172,
            ymax: 6050160.9541768255,
          },
        });

        //Map UI
        const opacitySlider = new Slider({
          container: 'sliderDiv',
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
        view.ui.add(opacitySlider, {
          position: 'top-right',
          index: 2,
        });
        view.ui.move('zoom', 'top-right');
        view.ui.add(
          new BasemapToggle({
            view,
            nextBasemap: 'satellite',
          }),
          'bottom-right'
        );

        view.when().then(() => {
          console.log('DETAILS MAP LOADED');
          //Set Center at First Load
          let intervalGetCenter = setInterval(() => {
            const $source = $('#details-source').find(':selected');
            const sourceCheck = $source.data('x');
            if (sourceCheck) {
              const newPoint = new Point({
                x: $source.data('x'),
                y: $source.data('y'),
                spatialReference: { wkid: 3857 },
              });
              view.center = newPoint;
              view.zoom = 21;
              const mapyear = $source.data('mapyear');
              const url = getUrl(mapyear);
              createTileLayer(url);
              addMarker($source.data('type'), newPoint);
              setLoadingMap(false);
              clearInterval(intervalGetCenter);
            }
          }, 500);
          //Full Details Source Change
          $('.page-content').on('change', '#details-source', function () {
            const type = $(this).find(':selected').data('type');
            const itemId = $(this).find(':selected').data('id');
            const markerX = $(this).find(':selected').data('x');
            const markerY = $(this).find(':selected').data('y');
            const recnumber = $(this).find(':selected').data('recnumber');
            const markerid = $(this).find(':selected').data('markerid');
            const mapyear = $(this).find(':selected').data('mapyear');
            const point = new Point({
              x: markerX,
              y: markerY,
              spatialReference: { wkid: 3857 },
            });
            console.log(
              'SOURCE CHANGE',
              mapyear,
              point,
              itemId,
              recnumber,
              markerid,
              type
            );
            const url = getUrl(mapyear);
            createTileLayer(url);
            addMarker(type, point);
            gotoMarker(point);
          });
        });

        //Map Opacity
        function updateOpacity() {
          const opacity = opacitySlider.values[0] / 100;
          view.layerViews.items[0].layer.opacity = opacity;
        }
        //Add Marker
        function addMarker(type, point) {
          const ifGraphics = view.graphics.length;
          let markerUrl = null;
          switch (type.toLowerCase()) {
            case 'people':
              markerUrl = peopleMarkerImage;
              break;
            case 'building':
              markerUrl = placesMarkerImage;
              break;
            case 'story':
              markerUrl = storiesMarkerImage;
              break;
            default:
              console.log(`TYPE ERROR: ${type} is not a valid option`);
          }
          //Check for existing markers and then remove
          if (ifGraphics) {
            const existingGraphics = view.graphics.items;
            existingGraphics.forEach(function (item) {
              view.graphics.remove(item);
            });
          }
          if (markerUrl) {
            const markerSymbol = {
              type: 'picture-marker', // autocasts as new SimpleMarkerSymbol()
              url: markerUrl,
              width: '30px',
              height: '30px',
            };
            const pointGraphic = new Graphic({
              geometry: point,
              symbol: markerSymbol,
            });
            view.graphics.add(pointGraphic);
          } else {
            console.log(
              `MARKER ERROR: type not valid, unable to generate symbol`
            );
          }
        }

        //Pan and Zoom map to a given marker
        function gotoMarker(point) {
          //console.log('gotoMarker', markerid);
          const opts = {
            duration: 3000,
          };
          view.goTo({ target: point, zoom: 21 }, opts).then(() => {
            console.log('DETAIL MARKER GOTO');
          });
        }

        //Add Tiled Map Layer
        function createTileLayer(url) {
          const tileLayer = new TileLayer({
            id: 'title_layer',
            url,
            visible: show,
          });
          addToView(tileLayer);
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

        //Get Tiled Map URL based on Map Year
        function getUrl(mapyear) {
          let newUrl;
          $('#date-range .segment').each(function () {
            const min = $(this).data('min');
            const max = $(this).data('max');
            const url = $(this).data('url');
            if (mapyear >= min && mapyear <= max) {
              newUrl = url;
            }
          });
          return newUrl;
        }
      }
    );
  }, [show]);

  return (
    <div className={`details-map-container ${show ? 'show' : 'hide'}`}>
      <div className="details-map" ref={mapRef} />
      {loadingMap && <Loader />}
    </div>
  );
}
