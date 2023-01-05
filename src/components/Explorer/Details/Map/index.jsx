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
import peopleRelatedMarkerImage from './images/marker_person.png';
import placesRelatedMarkerImage from './images/marker_place.png';
import storiesRelatedMarkerImage from './images/marker_story.png';
//Components
import Loader from '../../Map/Loader';
//Modules
import { detailsmMapPickerList } from './modules/detailsMapPickerList';

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
        Point,
        Slider,
        Expand,
        BasemapToggle,
      ]) => {
        // Create the Basemap
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

        // Create the Map
        const map = new Map({
          basemap: modern_antique,
        });

        // Create the View
        const view = new MapView({
          map: map,
          container: mapRef.current,
          extent: {
            spatialReference: { wkid: 3857 },
            xmin: -9994328.830936352,
            xmax: -9700657.768264594,
            ymin: 5872979.92261172,
            ymax: 6050160.9541768255,
          },
        });

        // Feature Reduction for relatedContentLayer
        const relatedClusterConfig = {
          type: 'cluster',
          clusterRadius: '200px',
          clusterMinSize: '30px',
          clusterMaxSize: '30px',
          labelsVisible: true,
          labelingInfo: [
            {
              symbol: {
                type: 'text',
                haloColor: '#373837',
                haloSize: '2px',
                color: '#f0f0f0',
                font: {
                  size: '18px',
                },
                xoffset: 0,
                yoffset: '-30px',
              },
              labelPlacement: 'center-center',
              labelExpressionInfo: {
                expression:
                  'Text($feature.cluster_count, "#,###") + " Related " + Proper($feature.cluster_type_type)',
              },
            },
          ],
          popupTemplate: {
            title: 'Related {expression/title}',
            content: `{expression/names}`,
            fieldInfos: [
              {
                fieldName: 'cluster_count',
                format: {
                  places: 0,
                  digitSeparator: true,
                },
              },
              {
                fieldName: 'expression/title',
              },
              {
                fieldName: 'expression/names',
              },
            ],
            expressionInfos: [
              {
                name: 'title',
                title: 'popup title',
                type: 'text',
                expression: `
                Proper($feature.cluster_type_type)
                `,
              },
              {
                name: 'names',
                title: 'list of names',
                type: 'text',
                expression: `
                var list = [];
                for (var i in $aggregatedFeatures) {
                  Push(list, i.title);
                }
                return list;
                `,
              },
            ],
          },
        };
        // Renderer for relatedContentLayer
        const relatedMarkerRenderer = {
          type: 'unique-value',
          field: 'type',
          uniqueValueInfos: [
            {
              value: 'people',
              label: 'People',
              symbol: {
                type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
                url: peopleRelatedMarkerImage,
                width: '30px',
                height: '30px',
              },
            },
            {
              value: 'places',
              label: 'Places',
              symbol: {
                type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
                url: placesRelatedMarkerImage,
                width: '30px',
                height: '30px',
              },
            },
            {
              value: 'stories',
              label: 'Stories',
              symbol: {
                type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
                url: storiesRelatedMarkerImage,
                width: '30px',
                height: '30px',
              },
            },
          ],
        };
        // Popup for relatedContentLayer
        const asyncMarkerContent = (target) => {
          const id = target.graphic.attributes.id;
          const recnumber = target.graphic.attributes.recnumber;
          const loctype = target.graphic.attributes.loctype;
          const year = target.graphic.attributes.year;
          return `
          <div class="related-marker-info">
            <div>ID: ${id}</div>
            <div>RECNUMBER: ${recnumber}</div>
            <div>LOCTYPE: ${loctype}</div>
            <div>MAP YEAR: ${year}</div>
          </div>
          `;
        };
        // Create relatedContentLayer
        const relatedContentLayer = new FeatureLayer({
          id: `related_content`,
          opacity: 1,
          visible: show,
          outFields: ['*'],
          source: [],
          fields: [
            {
              name: 'ObjectID',
              alias: 'ObjectID',
              type: 'oid',
            },
            {
              name: 'type',
              alias: 'Type',
              type: 'string',
            },
            {
              name: 'title',
              alias: 'Title',
              type: 'string',
            },
            {
              name: 'id',
              alias: 'ID',
              type: 'string',
            },
            {
              name: 'recnumber',
              alias: 'RECNUMBER',
              type: 'string',
            },
            {
              name: 'loctype',
              alias: 'LOCTYPE',
              type: 'string',
            },
          ],
          objectIdField: 'ObjectID',
          spatialReference: { wkid: 3857 },
          geometryType: 'point',
          featureReduction: relatedClusterConfig,
          renderer: relatedMarkerRenderer,
          popupTemplate: {
            title: '{title}',
            outFields: ['*'],
            content: asyncMarkerContent,
          },
        });
        // Map UI
        view.ui.move('zoom', 'top-right');
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
        // opacitySlider.on(['thumb-change', 'thumb-drag'], updateOpacity);
        // const basemapToggle = new BasemapToggle({
        //   view,
        //   nextBasemap: 'satellite',
        // });
        // const baseMapExpand = new Expand({
        //   expandIconClass: 'esri-icon-basemap',
        //   view: view,
        //   content: basemapToggle,
        //   expandTooltip: 'Basemap',
        //   group: 'top-right',
        // });
        // const detailsMapPickerExpand = new Expand({
        //   view,
        //   expandIconClass: 'esri-icon-collection',
        //   content: 'loading...',
        //   expandTooltip: 'Map Overlays',
        //   group: 'top-right',
        // });
        // view.ui.add(
        //   [detailsMapPickerExpand, baseMapExpand, opacitySlider],
        //   'top-right'
        // );
        // detailsMapPickerExpand.when().then(function (picker) {
        //   detailsmMapPickerList().then((res) => {
        //     picker.content = res;
        //   });
        // });

        // Wait for View to be loaded
        view.when().then(() => {
          console.log('DETAILS MAP VIEW LOADED');
          // Wait for Sources, then set center, add Tile, Source and Realated layers to view
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
              addTileLayer(url);
              addSourceLayer($source.data('type'), $source.text(), newPoint);
              addRelatedLayer();
              setLoadingMap(false);
              clearInterval(intervalGetCenter);
            }
          }, 500);

          // Event - Full Details Sources Change
          $('.page-content').on('change', '#details-source', function () {
            const type = $(this).find(':selected').data('type');
            const itemId = $(this).find(':selected').data('id');
            const name = $(this).find(':selected').text();
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
            // Clear map
            view.popup.close();
            removeTileLayer();
            removeLayer('source_location');
            removeRelated('all');
            // Update layers
            const url = getUrl(mapyear);
            addTileLayer(url);
            addSourceLayer(type, name, point);
            addRelatedLayer();
            gotoMarker(point);
            //updateMapPicker();
            $('.details-map-container').css('z-index', '-1');
          });

          // Event - Related Content choose item
          $('.page-content').on(
            'click',
            '.detail-related .related-data-item',
            function () {
              setLoadingMap(true);
              // Clear map
              view.popup.close();
              removeRelated('all');
              // Update map
              let intervalNewCenter = setInterval(() => {
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
                  addTileLayer(url);
                  addSourceLayer(
                    $source.data('type'),
                    $source.text(),
                    newPoint
                  );
                  addRelatedLayer();
                  setLoadingMap(false);
                  clearInterval(intervalNewCenter);
                }
              }, 500);
            }
          );

          // Event - Related Content map toggle
          $('.page-content').on(
            'click',
            '.related-data-group-footer .toggle-switch-checkbox',
            function () {
              console.log('TOGGLE CLICK');
              const type = $(this)
                .closest('.detail-related')
                .find('.detail-related-tabs .active')
                .data('type');
              console.log('TAB TYPE', type);
              const checked = $(this).is(':checked');
              console.log('SHOW ON MAP', checked);
              const markers = [];
              $(this)
                .closest('.related-data-group')
                .find('div:not(.related-data-group-footer)')
                .each(function () {
                  const title = $(this).data('title');
                  const id = $(this).data('id');
                  const recnumber = $(this).data('recnumber');
                  const loctype = $(this).data('loctype');
                  const year = $(this).data('year');
                  const x = $(this).data('x');
                  const y = $(this).data('y');
                  if (x && y) {
                    markers.push({
                      title,
                      id,
                      recnumber,
                      loctype,
                      year,
                      x,
                      y,
                    });
                  }
                });
              if (checked && markers.length) {
                addRelated(type, markers);
                $('.details-map-container').css('z-index', '1');
              } else {
                view.popup.close();
                removeRelated(markers);
                //removeRelated('all');
                $('.details-map-container').css('z-index', '-1');
              }
            }
          );

          // Event - Related Content tab change
          $('.page-content').on(
            'click',
            '.detail-related.open .tab',
            function () {
              // Clear map
              view.popup.close();
              removeRelated('all');
              $('.details-map-container').css('z-index', '-1');
            }
          );

          // Event - Related Content close
          $('.page-content').on(
            'click',
            '.detail-related.open .detail-related-heading',
            function () {
              // Clear map
              view.popup.close();
              removeRelated('all');
              $('.details-map-container').css('z-index', '-1');
            }
          );

          // Event - Map Picker List Item Click Event
          $('.page-content').on('click', '.details-map-picker li', function () {
            console.log('DETAILS MAP PICKER');
            const type = $('#details-source').find(':selected').data('type');
            const markerX = $('#details-source').find(':selected').data('x');
            const markerY = $('#details-source').find(':selected').data('y');
            const name = $('#details-source').find(':selected').text();
            const url = $(this).find('span.url').text();
            const point = new Point({
              x: markerX,
              y: markerY,
              spatialReference: { wkid: 3857 },
            });
            // Clear map
            view.popup.close();
            removeTileLayer();
            removeLayer('source_location');
            removeRelated('all');
            // Update layers
            addTileLayer(url);
            addSourceLayer(type, name, point);
            addRelatedLayer();
            gotoMarker(point);
          });
        });

        //Map Opacity
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
        function addTileLayer(url) {
          console.log('ADD TILE LAYER');
          const tileLayer = new TileLayer({
            id: 'tile_layer',
            url,
            visible: show,
          });
          view.map.add(tileLayer);
          updateOpacity();
        }

        //Remove Tiled Map Layer
        function removeTileLayer() {
          console.log('REMOVE TILE LAYER');
          removeLayer('tile_layer');
        }

        //Add Source Location Layer
        function addSourceLayer(type, source, point) {
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
          if (markerUrl) {
            const sourceGraphic = new Graphic({
              geometry: point,
              attributes: {
                type,
                source: source,
              },
            });
            const sourceLayer = new FeatureLayer({
              title: source,
              id: 'source_location',
              outFields: ['*'],
              source: [sourceGraphic],
              fields: [
                {
                  name: 'ObjectID',
                  alias: 'ObjectID',
                  type: 'oid',
                },
                {
                  name: 'type',
                  alias: 'Type',
                  type: 'string',
                },
                {
                  name: 'source',
                  alias: 'Source',
                  type: 'string',
                },
              ],
              objectIdField: 'ObjectID',
              geometryType: 'point',
              spatialReference: { wkid: 3857 },
              renderer: {
                type: 'simple',
                symbol: {
                  type: 'picture-marker',
                  url: markerUrl,
                  width: '30px',
                  height: '30px',
                },
              },
              popupTemplate: {
                title: '{Source}',
              },
            });
            view.map.add(sourceLayer);
          } else {
            console.log('Error: Source Layer not able to be added');
          }
        }

        //Add Related Content Layer
        function addRelatedLayer() {
          view.map.add(relatedContentLayer);
        }

        function addRelated(type, markers) {
          console.log('MAP ADD FEATURES', type, markers);
          // create an array of graphics based on markers
          let graphics = [];
          markers.forEach((marker) => {
            //console.log('MARKER', markers);
            const point = new Point({
              x: marker.x,
              y: marker.y,
              spatialReference: { wkid: 3857 },
            });
            const attr = {
              type,
              title: marker.title,
              id: marker.id,
              recnumber: marker.recnumber,
              loctype: marker.loctype,
            };
            const graphic = new Graphic({
              geometry: point,
              attributes: attr,
            });
            graphics.push(graphic);
          });

          // addEdits object tells applyEdits that you want to add the features
          const addEdits = {
            addFeatures: graphics,
          };

          // apply the edits to the layer
          applyEditsToLayer(addEdits);
        }

        function removeRelated(markers) {
          console.log('MAP REMOVE FEATURES', markers);
          let removeRequest = [];
          if (markers !== 'all') {
            markers.forEach((marker) => {
              removeRequest.push(marker.id);
            });
          }
          // query for the features you want to remove
          relatedContentLayer.queryFeatures().then((results) => {
            let removeItems = [];
            results.features.forEach((feature) => {
              if (markers !== 'all') {
                const includes = removeRequest.includes(feature.attributes.id);
                if (includes) {
                  removeItems.push({ objectId: feature.attributes.ObjectID });
                }
              } else {
                removeItems.push({ objectId: feature.attributes.ObjectID });
              }
            });
            // edits object tells apply edits that you want to delete the features
            const deleteEdits = {
              deleteFeatures: removeItems,
            };
            // apply edits to the layer
            applyEditsToLayer(deleteEdits);
          });
        }

        function applyEditsToLayer(edits) {
          relatedContentLayer
            .applyEdits(edits)
            .then((results) => {
              // get extent of the Source Location layer
              let sourceExtent = null;
              const existingLayers = view.map.layers.items;
              existingLayers.forEach(function (item, i) {
                if (item.id === 'source_location') {
                  sourceExtent = item.fullExtent;
                }
              });
              // if edits were removed
              if (results.deleteFeatureResults.length > 0) {
                if (sourceExtent) {
                  view.goTo(sourceExtent);
                }
                console.log(
                  results.deleteFeatureResults.length,
                  'features have been removed'
                );
                relatedContentLayer.refresh();
              }
              // if features were added - call queryFeatures to return
              //    newly added graphics
              if (results.addFeatureResults.length > 0) {
                let objectIds = [];
                results.addFeatureResults.forEach((item) => {
                  objectIds.push(item.objectId);
                });
                // query the newly added features from the layer
                relatedContentLayer
                  .queryFeatures({
                    objectIds: objectIds,
                  })
                  .then((results) => {
                    console.log(
                      results.features.length,
                      'features have been added.'
                    );
                    relatedContentLayer.queryExtent().then((results) => {
                      const relatedExtent = results.extent.clone();
                      if (sourceExtent) {
                        const sourceExtentClone = sourceExtent.clone();
                        const fullExtent =
                          relatedExtent.union(sourceExtentClone);
                        view.goTo(fullExtent);
                      } else {
                        view.goTo(relatedExtent);
                      }
                    });
                    relatedContentLayer.refresh();
                  });
              }
            })
            .catch((error) => {
              console.error();
            });
        }
        //Remove Layer based on ID
        function removeLayer(layerId) {
          const ifLayers = view.map.layers.items.length;
          if (ifLayers) {
            const existingLayers = view.map.layers.items;
            //const existingLayersIDs = existingLayers.map((layer) => layer.id);
            //console.log('existingLayersIDs', existingLayersIDs);
            existingLayers.forEach(function (item, i) {
              if (layerId === item.id) {
                view.map.layers.remove(item);
              }
            });
          }
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

        //Update Map Picker
        // function updateMapPicker() {
        //   detailsmMapPickerList().then((res) => {
        //     detailsMapPickerExpand.content = res;
        //   });
        // }
      }
    );
  }, []);

  return (
    <div className={`details-map-container`}>
      <div className="details-map" ref={mapRef} />
      {loadingMap && <Loader />}
    </div>
  );
}
