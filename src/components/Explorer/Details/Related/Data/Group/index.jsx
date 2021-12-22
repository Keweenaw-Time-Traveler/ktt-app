//React
import React, { useState } from 'react';
import $ from 'jquery';
//Redux
import { useDispatch } from 'react-redux';
import { getDetails } from '../../../../../../redux/reducers/detailsSlice';
import { toggleRelated } from '../../../../../../redux/reducers/relatedSlice';
//Styles
import './styles.scss';
//Components
import ToggleSwitch from './ToggleSwitch';

export default function Group(props) {
  const dispatch = useDispatch();
  const { id, results } = props;
  const [map, setMap] = useState(false);

  const handleChange = (checked, id) => {
    setMap(checked);
    console.log(`TOOGLE ID: ${id}`);
  };

  const handleClick = (id, recnumber, loctype) => {
    console.log(`GET DETAILS: ${id}, ${recnumber}, ${loctype}`);
    dispatch(getDetails({ id, recnumber, loctype }));
    dispatch(toggleRelated('hide'));
    $('.detail-related-content').outerHeight(0);
  };

  return (
    <div className="related-data-group accordion-panel">
      {results.map((item, index) => (
        <div
          key={index}
          data-title={item.title}
          data-id={item.id}
          data-recnumber={item.recnumber}
          data-loctype={item.loctype}
          data-year={item.year}
          data-x={item.x}
          data-y={item.y}
          onClick={() => handleClick(item.id, item.recnumber, item.loctype)}
        >
          {item.title}
        </div>
      ))}
      <div className="related-data-group-footer">
        <label>Show On Map</label>
        <ToggleSwitch
          id={id}
          small
          disabled={false}
          checked={map}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
