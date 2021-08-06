//React
import React, { useState } from 'react';
//Redux
import { useDispatch } from 'react-redux';
import { updateType } from '../../../redux/reducers/filtersSlice';
import { getList } from '../../../redux/reducers/listSlice';
//Styles
import './styles.scss';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGlobe,
  faUser,
  faBuilding,
  faBookOpen,
  faCamera,
  faStar,
} from '@fortawesome/pro-solid-svg-icons';

//Components
import Status from './Status';
import RadioButton from './RadioButton';
import ToggleSwitch from './ToggleSwitch';

export default function Filters() {
  const dispatch = useDispatch();
  const [type, setType] = useState('all');
  const [photos, setPhotos] = useState(false);
  const [featured, setFeatured] = useState(false);

  const handleRadioChange = (e) => {
    setType(e.target.value);
    dispatch(updateType(e.target.value));
    dispatch(getList({}));
  };

  return (
    <div className="filters">
      <div className="filters-left">
        <Status />
      </div>
      <div className="filters-right">
        <div className="filter-radios">
          <RadioButton
            changed={handleRadioChange}
            id="1"
            isSelected={type === 'all'}
            label="Everything"
            icon={faGlobe}
            value="all"
          />
          <RadioButton
            changed={handleRadioChange}
            id="2"
            isSelected={type === 'people'}
            label="People"
            icon={faUser}
            value="people"
          />
          <RadioButton
            changed={handleRadioChange}
            id="3"
            isSelected={type === 'places'}
            label="Places"
            icon={faBuilding}
            value="places"
          />
          <RadioButton
            changed={handleRadioChange}
            id="4"
            isSelected={type === 'stories'}
            label="Stories"
            icon={faBookOpen}
            value="stories"
          />
        </div>
        <div className="filter-toggles">
          <div className="filter-toogle">
            <label htmlFor="photos" className="toggle-label">
              <FontAwesomeIcon icon={faCamera} className="toggle-icon" />
              Photos
            </label>
            <ToggleSwitch
              id="photos"
              small
              disabled={false}
              checked={photos}
              onChange={setPhotos}
            />
          </div>
          <div className="filter-toogle">
            <label htmlFor="featured" className="toggle-label">
              <FontAwesomeIcon icon={faStar} className="toggle-icon" />
              Featured
            </label>
            <ToggleSwitch
              id="featured"
              small
              disabled={false}
              checked={featured}
              onChange={setFeatured}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
