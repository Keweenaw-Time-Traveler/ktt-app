//React
import React, { useState } from 'react';
import $ from 'jquery';
//Redux
import { useDispatch } from 'react-redux';
import { updateSearch } from '../../../../../../redux/reducers/filtersSlice';
import { getDetails } from '../../../../../../redux/reducers/detailsSlice';
import {
  toggleRelated,
  toggleRelatedMap,
} from '../../../../../../redux/reducers/relatedSlice';
import {
  updateListItem,
  getList,
} from '../../../../../../redux/reducers/listSlice';
//Styles
import './styles.scss';
//Components
import ToggleSwitch from './ToggleSwitch';

export default function Group(props) {
  const dispatch = useDispatch();
  const { id, results, type, mapit } = props;
  const [checked, setChecked] = useState(false);

  //console.log('GROUP RESULTS', results);

  const handleChange = (checked, id) => {
    setChecked(checked);
    dispatch(toggleRelatedMap(checked));
    console.log(`TOOGLE ID: ${id}`);
  };

  const handleClick = (id, recnumber, loctype, title) => {
    console.log('RELATED CLICK - GET FULL DETAILS:', {
      id,
      recnumber,
      loctype,
    });
    dispatch(getDetails({ id, recnumber, loctype }));
    dispatch(toggleRelated('hide'));
    $('.detail-related-content').outerHeight(0);
    dispatch(updateListItem({ recnumber, loctype }));
    dispatch(updateSearch(title));
    console.log('GETLIST: /Explorer/Details/Related/Data/Group/index.jsx');
    dispatch(getList({}));
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
          onClick={() =>
            handleClick(item.id, item.recnumber, item.loctype, item.title)
          }
        >
          {item.title}
        </div>
      ))}
      {mapit && (
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
      )}
    </div>
  );
}
