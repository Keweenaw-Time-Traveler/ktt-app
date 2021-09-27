//React
import React from 'react';
//Redux
import { useSelector } from 'react-redux';
import {
  selectShowList,
  selectRemoveList,
} from '../../redux/reducers/listSlice';
//Components
import List from './List';
import Map from './Map';
//import EsriMap from './TestMap';
//Styles
import './styles.scss';

export default function ExplorerApp() {
  const showList = useSelector(selectShowList);
  const removeList = useSelector(selectRemoveList);

  return (
    <>
      {removeList ? null : <List show={showList} />}
      <Map />
    </>
  );
}
