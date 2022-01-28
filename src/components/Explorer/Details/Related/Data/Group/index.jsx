//React
import React, { useState } from 'react';
import $ from 'jquery';
//Redux
import { useDispatch } from 'react-redux';
import { getDetails } from '../../../../../../redux/reducers/detailsSlice';
import { toggleRelated } from '../../../../../../redux/reducers/relatedSlice';
import { updateListItem } from '../../../../../../redux/reducers/listSlice';
//Styles
import './styles.scss';
//Components
import ToggleSwitch from './ToggleSwitch';

export default function Group(props) {
  const dispatch = useDispatch();
  const { id, results, type } = props;
  const [checked, setChecked] = useState(false);

  //console.log('GROUP RESULTS', results);

  const handleChange = (checked, id) => {
    setChecked(checked);
    console.log(`TOOGLE ID: ${id}`);
  };

  const handleClick = (id, recnumber, loctype) => {
    console.log('RELATED CLICK - GET FULL DETAILS:', {
      id,
      recnumber,
      loctype,
    });
    dispatch(getDetails({ id, recnumber, loctype }));
    dispatch(toggleRelated('hide'));
    $('.detail-related-content').outerHeight(0);
    dispatch(updateListItem({ recnumber, loctype }));
  };

  return (
    <div className="related-data-group accordion-panel">
      {results.map((item, index) => (
        <div
          key={index}
          className="related-data-item"
          data-title={item.title}
          data-id={item.id}
          data-type={type}
          data-recnumber={item.recnumber}
          data-markerid={item.markerid}
          data-loctype={item.loctype}
          data-mapyear={item.map_year}
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
          id={`toggle-${id}`}
          group={id}
          small
          disabled={false}
          checked={checked}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
