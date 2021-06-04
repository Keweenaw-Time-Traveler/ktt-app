//React
import React from 'react';
//Components
import List from './List';
import { KeTTMap } from './Map';
//Styles
import './styles.scss';

export default function RestView() {
  return (
    <>
      <List />
      <KeTTMap />
    </>
  );
}
