//React
import React from 'react';
//Redux
import { useSelector } from 'react-redux';
import {
  selectShowList,
  selectRemoveList,
} from '../../redux/reducers/listSlice';
import {
  selectShowDetails,
  selectRemoveDetails,
} from '../../redux/reducers/detailsSlice';
//Components
import List from './List';
import Details from './Details';
import Map from './Map';
//import EsriMap from './TestMap';
//Styles
import './styles.scss';

export default function ExplorerApp() {
  const showList = useSelector(selectShowList);
  const removeList = useSelector(selectRemoveList);
  const showDetails = useSelector(selectShowDetails);
  const removeDetails = useSelector(selectRemoveDetails);

  return (
    <>
      {removeList ? null : <List show={showList} />}
      {removeDetails ? null : <Details show={showDetails} />}
      <Map />
    </>
  );
}
