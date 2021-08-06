//React
import React from 'react';
//Styles
import './styles.scss';

export default function Intro(props) {
  return (
    <div className={props.show ? 'intro show' : 'intro hide'}>
      <div className="logo" role="img" aria-label="KeTT Logo"></div>
      <h1>Historical Data &amp; Maps</h1>
      <h2>Connected Through Time &amp; Space</h2>
    </div>
  );
}
