//React
import React, { useState } from 'react';
//Styles
import './styles.scss';
//Components
import FileUploader from './FileUploader';

const Submit = (props) => {
  const [name, setName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const submitForm = () => {};

  return (
    <div className={`submit-wrapper ${props.show ? 'show' : 'hide'}`}>
      <div className="title">Share a Story</div>
      <div className="instructions">
        Click a point on the map to locate your story.
      </div>
      <label>Story Title</label>
      <form>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <FileUploader
          onFileSelectSuccess={(file) => setSelectedFile(file)}
          onFileSelectError={({ error }) => alert(error)}
        />
        <button onClick={submitForm}>Submit</button>
      </form>
    </div>
  );
};

export default Submit;
