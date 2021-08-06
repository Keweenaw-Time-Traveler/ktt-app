//React
import React, { useEffect, useState } from 'react';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  getList,
  selectAllList,
  selectListStatus,
} from '../../../redux/reducers/listSlice';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/pro-solid-svg-icons';
//Styles
import './styles.scss';

const List = (props) => {
  const dispatch = useDispatch();
  const list = useSelector(selectAllList);
  const peopleList = list.active.people.results;
  const placesList = list.active.places.results;
  const storiesList = list.active.stories.results;
  const listStatus = useSelector(selectListStatus);

  useEffect(() => {
    if (listStatus === 'idle') {
      dispatch(getList({}));
    }
  }, [listStatus, dispatch]);

  const handleListClick = (e) => {
    // const itemId = e.target.getAttribute('data-id');
    // dispatch(updateListItem(itemId));
    // const view = window.kettView;
    // const graphics = window.activeGraphics;
    // console.log('ACTIVE GRAPHICS', graphics);
    // view.popup.open({
    //   features: graphics[0], // array of graphics or a single graphic in an array
    // });
    // const layers = view.map.layers;
    // layers.items.forEach((layer, index) => {
    //   if (layer.id === 'marker_layer_active') {
    //     console.log('RETURN MARKER LAYER', layer);
    //   }
    // });
  };

  return (
    <div className={`list-wrapper ${props.show ? 'show' : 'hide'}`}>
      <div className="list-results">
        <div className="list-results-heading people">
          <span className="txt">({list.active.people.length}) People </span>
        </div>
        {listStatus === 'idle' ? (
          <div>
            Finding People <FontAwesomeIcon icon={faCircleNotch} spin />
          </div>
        ) : (
          peopleList.map((people, index) => (
            <div
              className="list-results-item tooltip"
              key={index}
              title={people.title}
              data-id={people.id}
              onClick={handleListClick}
            >
              {people.title}
            </div>
          ))
        )}
        <div className="list-results-heading places">
          <span className="txt">({list.active.places.length}) Places</span>
        </div>
        {listStatus === 'idle' ? (
          <div>
            Finding Places <FontAwesomeIcon icon={faCircleNotch} spin />
          </div>
        ) : (
          placesList.map((places, index) => (
            <div
              className="list-results-item tooltip"
              key={index}
              title={places.title}
            >
              {places.title}
            </div>
          ))
        )}
        <div className="list-results-heading stories">
          <span className="txt">({list.active.stories.length}) Stories</span>
        </div>
        {listStatus === 'idle' ? (
          <div>
            Finding Stories <FontAwesomeIcon icon={faCircleNotch} spin />
          </div>
        ) : (
          storiesList.map((stories, index) => (
            <div
              className="list-results-item tooltip"
              key={index}
              title={stories.title}
            >
              {stories.title}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default List;
