//React
import React from 'react';
//Components
import List from './List';
import { Map } from './Map';
//Styles
import './styles.scss';

export default function RestView() {
  return (
    <>
      <List />
      <Map />
    </>
  );
}
