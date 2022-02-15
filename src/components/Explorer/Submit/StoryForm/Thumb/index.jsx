import React, { useState, useEffect } from 'react';
//Styles
import './styles.scss';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/pro-regular-svg-icons';

const Thumb = ({ file, clear }) => {
  const [loading, setLoading] = useState(false);
  const [thumb, setThumb] = useState(undefined);

  useEffect(() => {
    setLoading(true);
    let reader = new FileReader();
    reader.readAsDataURL(file);
    console.log('READER', reader);
    reader.onloadend = () => {
      setLoading(false);
      setThumb(reader.result);
    };
  }, [file]);

  if (loading) {
    return <p>loading...</p>;
  }

  return (
    <div className="form-thumb">
      <img src={thumb} alt={file.name} height={200} width={200} />
      <span className="clear" onClick={clear}>
        <FontAwesomeIcon icon={faTimesCircle} className="fa-icon" />
      </span>
    </div>
  );
};

export default Thumb;
