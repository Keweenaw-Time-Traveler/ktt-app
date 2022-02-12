//React
import React, { useState } from 'react';
//Styles
import './styles.scss';
//Components
import FileUploader from './FileUploader';

const Submit = (props) => {
  return (
    <div className={`submit-wrapper ${props.show ? 'show' : 'hide'}`}>
      <div className="title">Share a Story</div>
      <div className="instructions">
        Click a point on the map to locate your story.
      </div>
      <FileUploader />
    </div>
  );
};

export default Submit;
