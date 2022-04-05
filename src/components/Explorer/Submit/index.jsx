//React
import React, { useState } from 'react';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import { toggleSubmit } from '../../../redux/reducers/submitSlice';
//Tooptip
import Tooltip from 'react-tooltip-lite';
//Styles
import './styles.scss';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/pro-light-svg-icons';
//Components
import StoryForm from './StoryForm';

const Submit = (props) => {
  const dispatch = useDispatch();

  function handleCloseClick() {
    dispatch(toggleSubmit('hide'));
  }

  return (
    <div className={`submit-wrapper ${props.show ? 'show' : 'hide'}`}>
      <div className="submit-title">Share a Story</div>
      <div className="submit-close" onClick={handleCloseClick}>
        <Tooltip content="Cancel Story Submission" direction="right">
          <FontAwesomeIcon icon={faTimes} className="fa-icon" />
        </Tooltip>
      </div>
      <div className="submit-instructions">
        Click a point on the map to locate your story.
      </div>
      <StoryForm />
    </div>
  );
};

export default Submit;
