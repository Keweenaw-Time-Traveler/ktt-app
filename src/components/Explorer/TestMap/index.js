import React, { useRef, useEffect } from 'react';
//ArchGIS
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';

// hooks allow us to create a map component as a function
function EsriMap({ id }) {
  // create a ref to element to be used as the map's container
  const mapEl = useRef(null);

  // use a side effect to create the map after react has rendered the DOM
  useEffect(
    () => {
      // define the view here so it can be referenced in the clean up function
      let view;

      // then we load a web map from an id
      const webmap = new WebMap({
        // autocasts as new PortalItem()
        portalItem: {
          // get item id from the props
          id,
        },
      });

      // and we show that map in a container
      view = new MapView({
        map: webmap,
        // use the ref as a container
        container: mapEl.current,
      });

      return () => {
        // clean up the map view
        if (!!view) {
          view.destroy();
          view = null;
        }
      };
    },
    // only re-load the map if the id has changed
    [id]
  );
  return <div className="esri-map" ref={mapEl} />;
}

export default EsriMap;
