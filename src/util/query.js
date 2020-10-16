//import { useEffect } from 'react';
import { loadModules } from 'esri-loader';

export const CountPeople = (filter) => {
  loadModules(['esri/tasks/QueryTask', 'esri/tasks/support/Query']).then(
    ([QueryTask, Query]) => {
      const url =
        'https://portal1-geo.sabu.mtu.edu:6443/arcgis/rest/services/KeweenawHSDI/KeTT_CityDir/MapServer/0';
      const queryTask = new QueryTask({
        url: url,
      });
      const query = new Query();
      query.returnGeometry = true;
      query.outFields = ['*'];
      query.where = filter; // Return all cities with a population greater than 1 million

      // When resolved, returns features and graphics that satisfy the query.
      queryTask.execute(query).then(function (results) {
        //console.log(results.features);
      });

      // When resolved, returns a count of the features that satisfy the query.
      queryTask.executeForCount(query).then(function (results) {
        document.getElementById('total-people').innerHTML = `${results}`;
      });
    }
  );
};
