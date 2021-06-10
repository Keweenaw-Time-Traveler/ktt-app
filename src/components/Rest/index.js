//React
import React from 'react';
//Components
import List from './List';
import { KeTTMap } from './Map';
//import EsriMap from './TestMap';
//Styles
import './styles.scss';

export default function RestView() {
  return (
    <>
      <List />
      <KeTTMap />
      {/* <EsriMap id="e691172598f04ea8881cd2a4adaa45ba" /> */}
    </>
  );
}
