//React
import React, { useState } from 'react';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import { selectSubmitRelated, toggleSubmit } from '../../../redux/reducers/submitSlice';
//Tooptip
import Tooltip from 'react-tooltip-lite';
//Styles
import './styles.scss';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/pro-light-svg-icons';
//Components
import Loader from '../Map/Loader';
import StoryForm from './StoryForm';

const Submit = (props) => {
  const dispatch = useDispatch();
  const id = useSelector(selectSubmitRelated);

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
      <div id="story-instructions" className={`submit-instructions ${id ? 'hide' : 'show'}`}>
        Click a point on the map to locate your story.
      </div>
      <StoryForm related={id} show={id ? 'show' : 'hide'} />
      <div id="submitted" className="submit-msg">
        <Loader />
        <div id="submit-success" class="success">
          <h2>Your story has been submitted!</h2>
          <p>Your submittion should appear on the site in a few moments, thank you for contributing to history!</p>
        </div>
        <div id="submit-fail" class="fail">
        
        </div>
      </div>
    </div>
  );
};

export default Submit;
