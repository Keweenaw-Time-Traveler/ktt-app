import React, { Component } from 'react';
import styles from './home.module.css'; // Import css modules stylesheet as styles

import { WebMapView } from '../../components/Map';

export class home extends Component {
  render() {
    return <WebMapView />;
  }
}

export default home;
