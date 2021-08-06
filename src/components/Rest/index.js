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
import KeTTMap from './Map';
//import EsriMap from './TestMap';
//Styles
import './styles.scss';

export default function RestView() {
  const showList = useSelector(selectShowList);
  const removeList = useSelector(selectRemoveList);
  return (
    <>
      {removeList ? null : <List show={showList} />}
      <KeTTMap />
      {/* <EsriMap id="e691172598f04ea8881cd2a4adaa45ba" /> */}
    </>
  );
}
